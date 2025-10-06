FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN printf '\nadd_header Cache-Control "no-store";\n' >> /etc/nginx/conf.d/default.conf
EXPOSE 80