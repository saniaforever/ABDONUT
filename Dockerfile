# Use the official PHP image with Apache
FROM php:8.1-apache

# Set the working directory in the container
WORKDIR /var/www/html

# Copy the application files to the container
COPY . /var/www/html

# Update the default directory index file to shine.html
RUN echo "DirectoryIndex shine.html" > /etc/apache2/conf-enabled/custom-index.conf

# Install PHP extensions if required (uncomment and modify as needed)
# RUN docker-php-ext-install mysqli pdo pdo_mysql

# Expose port 80 for the application
EXPOSE 80
