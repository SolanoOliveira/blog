#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p /workspace/.npm /workspace/.m2/repository
if [[ ! -x /workspace/jdk-21.0.8+9/bin/javac ]]; then
  curl --fail --location --silent --show-error 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.8%2B9/OpenJDK21U-jdk_x64_linux_hotspot_21.0.8_9.tar.gz' -o /tmp/blog-jdk.tar.gz
  curl --fail --location --silent --show-error 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.8%2B9/OpenJDK21U-jdk_x64_linux_hotspot_21.0.8_9.tar.gz.sha256.txt' -o /tmp/blog-jdk.sha256
  python3 - <<'PY'
import hashlib,pathlib
assert hashlib.file_digest(open('/tmp/blog-jdk.tar.gz','rb'),'sha256').hexdigest()==pathlib.Path('/tmp/blog-jdk.sha256').read_text().split()[0], 'JDK checksum mismatch'
PY
  tar -xzf /tmp/blog-jdk.tar.gz -C /workspace
fi
if [[ ! -x /workspace/apache-maven-3.9.11/bin/mvn ]]; then
  curl --fail --location --silent --show-error https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.tar.gz -o /tmp/blog-maven.tar.gz
  curl --fail --location --silent --show-error https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.tar.gz.sha512 -o /tmp/blog-maven.sha512
  python3 - <<'PY'
import hashlib,pathlib
assert hashlib.file_digest(open('/tmp/blog-maven.tar.gz','rb'),'sha512').hexdigest()==pathlib.Path('/tmp/blog-maven.sha512').read_text().split()[0], 'Maven checksum mismatch'
PY
  tar -xzf /tmp/blog-maven.tar.gz -C /workspace
fi
# Maven does not automatically read HTTPS_PROXY. Do not print proxy metadata.
python3 - <<'PY'
import os,urllib.parse,pathlib
from xml.sax.saxutils import escape
proxy=urllib.parse.urlparse(os.environ.get('HTTPS_PROXY',os.environ.get('https_proxy','')))
s='<settings>'
if proxy.hostname:
    s+='<proxies><proxy><id>cloud</id><active>true</active><protocol>http</protocol><host>'+escape(proxy.hostname)+'</host><port>'+str(proxy.port or 80)+'</port></proxy></proxies>'
pathlib.Path('/workspace/maven-settings.xml').write_text(s+'</settings>')
PY
export JAVA_HOME=/workspace/jdk-21.0.8+9
export PATH="$JAVA_HOME/bin:/workspace/apache-maven-3.9.11/bin:$PATH"
export MAVEN_OPTS="${MAVEN_OPTS:-} -Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts"
export npm_config_cache=/workspace/.npm
cd "$project_dir/frontend"
npm ci
npm run build
cd "$project_dir/backend"
mvn -s /workspace/maven-settings.xml -Dmaven.repo.local=/workspace/.m2/repository package
