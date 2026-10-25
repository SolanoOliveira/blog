package br.com.solano.blog;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "posts")
public class Post {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false, length = 160)
  public String title;

  @Column(nullable = false, length = 100000)
  public String content;

  @ElementCollection(fetch = FetchType.EAGER)
  @OrderColumn
  public List<String> images = new ArrayList<>();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  public Post() {}
}
