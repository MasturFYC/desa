server {
  listen 80;
  listen [::]:80;

  # server_name example.com www.example.com;
  
  #index index.php index.html index.htm;
  index index.html index.htm;

  server_name _;
  
  server_tokens off;
  error_log /home/fyc/log/nginx/php-error.log;
  access_log /home/fyc/log/nginx/php-access.log;

  gzip on;

  gzip_min_length 10240;
  gzip_proxied expired no-cache no-store private auth;
  gzip_types text/plain text/css text/xml application/json text/javascript application/x-javascript application/xml;
  gzip_disable "MSIE [1-6]\.";


  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }


  #  location ~ /home/ {
  #     #root /usr/share/nginx/home;
  #     try_files $uri $uri/ /home/index.html;
  #  }

    location ~ /\. {
            log_not_found off;
            deny all;
    }

}
