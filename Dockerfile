FROM php:8.1-apache

# Set the working directory in the container
WORKDIR /var/www/html

# Copy all project files to the container
COPY . /var/www/html

# Expose port 80 for Render
EXPOSE 80
