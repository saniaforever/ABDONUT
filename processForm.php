<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form inputs
    $name = htmlspecialchars($_POST['name']);
    $location = htmlspecialchars($_POST['location']);
    $phone = htmlspecialchars($_POST['phone']);
    $email = htmlspecialchars($_POST['email']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
    <link rel="stylesheet" href="shine.css">
    <style>
        .thank-you {
            font-family: 'Dancing Script', cursive;
            font-size: 2.5rem;
            color: #ff6f61;
            text-align: center;
            margin: 20px 0;
        }
        .user-details {
            font-family: Arial, sans-serif;
            font-size: 1.2rem;
            color: #555;
            text-align: center;
        }
        .subtitle {
            text-align: center;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="content">
        <h1 class="title">Petals and Bliss
            <div class="aurora">
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
                <div class="aurora__item"></div>
            </div>
        </h1>
        <p class="thank-you">Thank you for connecting with us, <strong><?php echo $name; ?></strong>!</p>
        <p class="user-details">We appreciate you reaching out and will be in touch soon.</p>
        <p class="subtitle">Here's the information we received:</p>
        <ul class="subtitle">
            <li><strong>Location:</strong> <?php echo $location; ?></li>
            <li><strong>Phone:</strong> <?php echo $phone; ?></li>
            <li><strong>Email:</strong> <?php echo $email; ?></li>
        </ul>
        <p class="subtitle">Bon Appétit!</p>
    </div>
</body>
</html>
