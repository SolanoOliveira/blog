package br.com.solano.blog;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:blogtest;DB_CLOSE_DELAY=-1",
      "blog.admin.password=test-password-for-tests",
      "blog.upload-dir=${java.io.tmpdir}/blog-test-uploads"
    })
@AutoConfigureMockMvc
class BlogApplicationTests {
  @Autowired MockMvc mvc;

  @Test
  void visitorsCanReadButCannotPublishOrUpload() throws Exception {
    mvc.perform(get("/api/posts")).andExpect(status().isOk());
    mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/posts")
                .with(csrf())
                .contentType("application/json")
                .content("{\"title\":\"x\",\"content\":\"y\",\"images\":[]}"))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            multipart("/api/images")
                .file(new MockMultipartFile("file", "x.png", "image/png", new byte[] {1}))
                .with(csrf()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void loginRequiresCorrectPasswordAndCsrf() throws Exception {
    mvc.perform(
            post("/api/login").param("username", "admin").param("password", "wrong").with(csrf()))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/login")
                .param("username", "admin")
                .param("password", "test-password-for-tests")
                .with(csrf()))
        .andExpect(status().isNoContent())
        .andExpect(authenticated());
    mvc.perform(
            post("/api/login")
                .param("username", "admin")
                .param("password", "test-password-for-tests"))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void authorCanPublishReadAndDelete() throws Exception {
    var output = new java.io.ByteArrayOutputStream();
    javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(2, 2, 1), "png", output);
    var upload =
        mvc.perform(
                multipart("/api/images")
                    .file(
                        new MockMultipartFile(
                            "file", "photo.png", "image/png", output.toByteArray()))
                    .with(csrf()))
            .andExpect(status().isCreated())
            .andReturn();
    var json = new com.fasterxml.jackson.databind.ObjectMapper();
    String image = json.readTree(upload.getResponse().getContentAsString()).get("url").asText();
    mvc.perform(get(image))
        .andExpect(status().isOk())
        .andExpect(content().contentType("image/png"));
    String payload =
        json.writeValueAsString(
            java.util.Map.of(
                "title",
                "Meu primeiro texto",
                "content",
                "Olá, mundo!\nUma nova história.",
                "images",
                java.util.List.of(image)));
    var published =
        mvc.perform(
                post("/api/posts").with(csrf()).contentType("application/json").content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Meu primeiro texto"))
            .andReturn();
    long id = json.readTree(published.getResponse().getContentAsString()).get("id").asLong();
    mvc.perform(get("/api/posts/" + id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.images[0]").value(image));
    mvc.perform(delete("/api/posts/" + id)).andExpect(status().isForbidden());
    mvc.perform(delete("/api/posts/" + id).with(csrf())).andExpect(status().isNoContent());
    mvc.perform(get("/api/posts/" + id)).andExpect(status().isNotFound());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void rejectsEmptyPostsExternalImagesAndInvalidFiles() throws Exception {
    mvc.perform(
            post("/api/posts")
                .with(csrf())
                .contentType("application/json")
                .content("{\"title\":\" \",\"content\":\" \",\"images\":[]}"))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/posts")
                .with(csrf())
                .contentType("application/json")
                .content(
                    "{\"title\":\"x\",\"content\":\"y\",\"images\":[\"https://example.com/a.png\"]}"))
        .andExpect(status().isBadRequest());
    mvc.perform(
            multipart("/api/images")
                .file(
                    new MockMultipartFile(
                        "file", "fake.png", "image/png", "not an image".getBytes()))
                .with(csrf()))
        .andExpect(status().isBadRequest());
  }
}
