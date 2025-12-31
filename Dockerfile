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

# Copy application files
COPY . .

# Create a dummy .env file for production
RUN echo "APP_ENV=prod" > .env && \
    echo "APP_SECRET=$(openssl rand -base64 32)" >> .env && \
    echo "DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy" >> .env

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Run composer post-install scripts
RUN composer run-script post-install-cmd

# Set permissions
RUN chown -R www-data:www-data var

EXPOSE 80
