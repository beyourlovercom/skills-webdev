<?php
/**
 * Plugin Name: BASWORLDY Local Catalog Pilot Homepage
 * Description: Redirect only the local WordPress homepage to the synthetic catalog pilot. Never publish to Dev/WWW.
 * Version: 0.1.0
 */
if (!defined('ABSPATH')) {
    exit;
}
add_action('template_redirect', static function (): void {
    if (is_admin() || !is_front_page()) {
        return;
    }
    if (wp_parse_url(home_url(), PHP_URL_HOST) !== 'localdev.basworldy.com') {
        return;
    }
    wp_safe_redirect(home_url('/catalog-pilot/index.html'), 302, 'BASWORLDY Local Pilot');
    exit;
}, 1);
