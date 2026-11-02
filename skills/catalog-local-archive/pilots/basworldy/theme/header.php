<!doctype html>
<html <?php language_attributes(); ?>><head>
<meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<?php wp_head(); ?></head>
<body <?php body_class(); ?>><?php wp_body_open(); ?>
<div class="utilitybar"><div class="shell utility-inner"><span>GLOBAL COMMERCIAL VEHICLE SOURCING</span><span>Independent local design concept&nbsp; · &nbsp;No live transactions</span></div></div>
<header class="sitehead"><div class="shell nav-row">
<a class="brandmark" href="<?php echo esc_url(home_url('/')); ?>" aria-label="Basworldy home"><span class="brand-symbol">B<span></span></span><span>BASWORLDY<small>COMMERCIAL VEHICLES</small></span></a>
<button class="nav-toggle" type="button" aria-controls="site-links" aria-expanded="false">☰ <span>Menu</span></button>
<nav id="site-links" class="mainnav" aria-label="Main menu">
<a href="<?php echo esc_url(home_url('/')); ?>">Home</a>
<a href="<?php echo esc_url(get_post_type_archive_link('vehicle')); ?>">All Vehicles</a>
<a href="<?php echo esc_url(home_url('/how-to-buy/')); ?>">How to Buy</a>
<a href="<?php echo esc_url(home_url('/transport-export/')); ?>">Transport & Export</a>
<a href="<?php echo esc_url(home_url('/insights/')); ?>">Insights</a>
<a href="<?php echo esc_url(home_url('/about-us/')); ?>">About Us</a>
</nav>
<a href="<?php echo esc_url(home_url('/contact/')); ?>" class="nav-contact">Contact <span>↗</span></a></div></header>
<?php bwy_pilot_notice(); ?>
<main id="main-content">