<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> | <?php bloginfo('description'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>


<header class="header container">
    <h1><?php bloginfo('name'); ?> | <?php bloginfo('description'); ?></h1>
    <h2>Welcome to the Header</h2>
</header>
