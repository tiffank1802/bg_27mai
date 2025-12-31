# Production image
FROM php:8.2-apache

WORKDIR /var/www/html

# Install dependencies including Node.js
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    libpq-dev \
    libonig-dev \
    nodejs \
    npm \
    && docker-php-ext-install \
    intl \
    opcache \
    zip \
    pdo_mysql \
    pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Build assets
RUN npm install && npm run build

# Run composer post-install scripts
RUN composer run-script post-install-cmd

# Set permissions
RUN chown -R www-data:www-data var

EXPOSE 80
