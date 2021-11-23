server {
    listen   80; ## listen for ipv4; this line is default and implied
    listen   [::]:80 default ipv6only=on; ## listen for ipv6

    root /hdd/pixel/www;
    index index.php index.html index.htm;

    # Make site accessible from http://localhost/
    server_name _;

    # Disable sendfile as per https://docs.vagrantup.com/v2/synced-folders/virtualbox.html
    sendfile off;

    # Security - Hide nginx version number in error pages and Server header
    server_tokens off;

    # Add stdout logging
    error_log /var/log/nginx/php-error.log;
    access_log /var/log/nginx/php-access.log;

    # reduce the data that needs to be sent over network
    gzip on;

    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml application/json text/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to index.php
        try_files $uri $uri/ /index.php?$query_string $uri/index.html;
    }

    location ~ /home/ {
       #root /usr/share/nginx/home;
       try_files $uri $uri/ /home/index.html;
    }

    location ~ /cpo-fitness/ {
       #root /usr/share/nginx/home;
       try_files $uri $uri/ /cpo-fitness/index.html;
    }

    location ~ /nsp-client/ {
        try_files $uri $uri/ /nsp-client/index.html;
    }

   # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # pass the PHP scripts to FastCGI server listening on socket
    #
    location ~ \.php$ {
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        try_files $uri $uri/ /index.php?$query_string;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        # include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        proxy_buffer_size       128k;
        proxy_buffers           4 256k;
        proxy_busy_buffers_size    256k;
    }

    location /docs {
        autoindex on;
        index nothing_will_match;
        autoindex_exact_size   off;
        autoindex_localtime    on;
        add_before_body        "/dir-list/nginx-before.html";
        add_after_body         "/dir-list/nginx-after.html";
    }

    location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml)$ {
        expires           5d;
    }

    # deny access to . files, for security
    #
    location ~ /\. {
            log_not_found off;
            deny all;
    }
}
