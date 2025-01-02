<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cart</title>
  <link rel="stylesheet" href="Mainpage.css">
</head>
<body>
  <header>
    <h1>We will revert back to you with our whole menu in a minute :)</h1>
    <a href="Mainpage.html" class="link">Explore a little more</a>
  </header>

  <h2>Connect with us!</h2>

  <form action="processForm.php" method="post">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required><br><br>

    <label for="location">Location:</label>
    <input type="text" id="location" name="location" required><br><br>

    <label for="phone">Phone Number:</label>
    <input type="tel" id="phone" name="phone" required><br><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br><br>

    <button type="submit" class="button">Submit</button>
  </form>

  <script src="yes.js"></script>
</body>
</html>
