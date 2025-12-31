# Build assets
FROM node:20-alpine AS assets_builder

WORKDIR /app

COPY package.json package-lock.json webpack.config.js ./
RUN npm install

COPY assets ./assets
# Copy other files that might be needed for build (e.g. templates if using tailwind)
COPY templates ./templates

RUN npm run build

# Production image
FROM php:8.2-apache

WORKDIR /var/www/html

# Install dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    libpq-dev \
    libonig-dev \
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

# Copy composer files
COPY composer.json composer.lock symfony.lock ./

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application files
COPY . .

# Copy built assets
COPY --from=assets_builder /app/public/build ./public/build

# Run composer post-install scripts (now that all files are present)
RUN composer run-script post-install-cmd

# Set permissions
RUN chown -R www-data:www-data var

EXPOSE 80
