<?php get_header(); ?>
<div class="shell inventory-wrap"><div class="bread"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a> / All Vehicles</div>
<div class="inventory-intro"><div><div class="overline">BASWORLDY VEHICLE STOCK / LOCAL PROTOTYPE</div><h1>Find your next <em>vehicle.</em></h1><p>Filter our fictional sample stock by brand, type and model year.</p></div><div class="inventory-count"><strong id="vehicle-count">4</strong><span>test vehicles</span></div></div>
<div class="inventory-layout"><aside class="filter-panel"><div class="filter-title"><h2>Filters</h2><span>01 — 04</span></div>
<form id="vehicle-filters" autocomplete="off">
<label for="filter-q">Search stock</label><input id="filter-q" name="q" type="search" placeholder="Model, reference...">
<label for="filter-type">Vehicle type</label><select id="filter-type" name="type"><option value="">All categories</option><option>Tipper truck</option><option>Tractor unit</option><option>Box truck</option><option>Flatbed truck</option></select>
<label for="filter-brand">Make / brand</label><select id="filter-brand" name="brand"><option value="">All brands</option><option>Atlas</option><option>Nord</option><option>Ridge</option></select>
<label for="filter-year">From year</label><select id="filter-year" name="year"><option value="">Any year</option><option>2023</option><option>2022</option><option>2020</option><option>2018</option></select>
<button type="reset" class="clear-filters">Clear all filters ↻</button></form>
<div class="filter-help"><strong>Need specific equipment?</strong><p>In the live version, your team can add extra specifications and qualified enquiries.</p></div>
</aside><div class="inventory-results"><div class="inventory-toolbar"><div><span class="result-indicator"></span> Available local demo listings</div><span>ILLUSTRATIVE DATA · NOT FOR SALE</span></div><div class="vehicle-grid inventory-cards">
<?php $q=new WP_Query(['post_type'=>'vehicle','posts_per_page'=>-1,'orderby'=>'date','order'=>'ASC']);while($q->have_posts()):$q->the_post();$v=bwy_vehicle_data(get_the_ID());?>
<div class="catalog-item" data-vehicle="<?php echo esc_attr($v['reference']); ?>" data-brand="<?php echo esc_attr($v['brand']); ?>" data-type="<?php echo esc_attr($v['category']); ?>" data-year="<?php echo esc_attr($v['year']); ?>"><?php get_template_part('template-parts/vehicle','card'); ?></div>
<?php endwhile;wp_reset_postdata(); ?></div></div></div></div>
<?php get_footer(); ?>