package br.com.solano.blog;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.*;

@Configuration
class SecurityConfig {
  @Bean
  UserDetailsService users(
      @Value("${blog.admin.username}") String username,
      @Value("${blog.admin.password}") String password) {
    if (password.length() < 12)
      throw new IllegalArgumentException(
          "BLOG_ADMIN_PASSWORD precisa ter pelo menos 12 caracteres");
    return new InMemoryUserDetailsManager(
        User.withUsername(username)
            .password("{bcrypt}" + new BCryptPasswordEncoder().encode(password))
            .roles("ADMIN")
            .build());
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    return http.authorizeHttpRequests(
            a ->
                a.requestMatchers("/api/csrf")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/",
                        "/index.html",
                        "/*.js",
                        "/*.css",
                        "/favicon.svg",
                        "/api/posts/**",
                        "/api/images/**")
                    .permitAll()
                    .anyRequest()
                    .hasRole("ADMIN"))
        .csrf(
            c ->
                c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
        .formLogin(
            f ->
                f.loginProcessingUrl("/api/login")
                    .successHandler((q, s, a) -> s.setStatus(204))
                    .failureHandler((q, s, e) -> s.setStatus(401))
                    .permitAll())
        .logout(l -> l.logoutUrl("/api/logout").logoutSuccessHandler((q, s, a) -> s.setStatus(204)))
        .exceptionHandling(e -> e.authenticationEntryPoint((q, s, x) -> s.sendError(401)))
        .build();
  }
}
