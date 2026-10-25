package br.com.solano.blog;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
class BlogController {
  private final PostRepository posts;
  private final Path uploads;

  BlogController(PostRepository posts, @Value("${blog.upload-dir}") String dir) throws IOException {
    this.posts = posts;
    this.uploads = Path.of(dir).toAbsolutePath();
    Files.createDirectories(uploads);
  }

  @GetMapping("/csrf")
  Map<String, String> csrf(CsrfToken token) {
    return Map.of("token", token.getToken());
  }

  @GetMapping("/me")
  Map<String, String> me(java.security.Principal user) {
    return Map.of("username", user.getName());
  }

  @GetMapping("/posts")
  List<Post> list() {
    return posts.findAllByOrderByCreatedAtDesc();
  }

  @GetMapping("/posts/{id}")
  Post get(@PathVariable Long id) {
    return posts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  record Draft(
      @NotBlank @Size(max = 160) String title,
      @NotBlank @Size(max = 100000) String content,
      @NotNull @Size(max = 12) List<String> images) {}

  @PostMapping("/posts")
  @ResponseStatus(HttpStatus.CREATED)
  Post create(@Valid @RequestBody Draft draft) {
    for (String image : draft.images())
      if (!image.matches("/api/images/[a-f0-9-]{36}\\.png")
          || !Files.isRegularFile(uploads.resolve(image.substring(12))))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem inválida");
    Post p = new Post();
    p.title = draft.title().strip();
    p.content = draft.content().strip();
    p.images = new ArrayList<>(draft.images());
    return posts.save(p);
  }

  @DeleteMapping("/posts/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable Long id) {
    Post p = get(id);
    posts.delete(p);
  }

  @PostMapping("/images")
  @ResponseStatus(HttpStatus.CREATED)
  Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem deve ter até 10 MB");
    byte[] bytes = file.getBytes();
    try (var stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
      var readers = ImageIO.getImageReaders(stream);
      if (!readers.hasNext())
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use uma imagem JPEG ou PNG");
      var reader = readers.next();
      try {
        reader.setInput(stream);
        if ((long) reader.getWidth(0) * reader.getHeight(0) > 20000000)
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem muito grande");
      } finally {
        reader.dispose();
      }
    }
    var image = ImageIO.read(new ByteArrayInputStream(bytes));
    if (image == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    String name = UUID.randomUUID() + ".png";
    ImageIO.write(image, "png", uploads.resolve(name).toFile());
    return Map.of("url", "/api/images/" + name);
  }

  @GetMapping("/images/{name}")
  ResponseEntity<Resource> image(@PathVariable String name) {
    if (!name.matches("[a-f0-9-]{36}\\.png"))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    var file = new FileSystemResource(uploads.resolve(name));
    if (!file.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .header("Cache-Control", "public, max-age=86400")
        .body(file);
  }
}
