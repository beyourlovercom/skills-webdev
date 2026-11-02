<?php $v=bwy_vehicle_data(get_the_ID()); ?>
<article class="vehicle-card" data-vehicle="<?php echo esc_attr($v['reference']); ?>">
<a class="vehicle-media" href="<?php the_permalink(); ?>">
<?php echo bwy_vehicle_image('vehicle-photo'); ?>
<span class="status-tag"><?php echo esc_html($v['condition']); ?> · demo</span>
</a>
<div class="vehicle-body"><span class="card-ref"><?php echo esc_html($v['reference']); ?> / <?php echo esc_html($v['category']); ?></span>
<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
<div class="spec-chips"><span><?php echo esc_html($v['year']); ?></span><span><?php echo esc_html(number_format((float)$v['mileage'])); ?> km</span><span><?php echo esc_html($v['axle']); ?></span></div>
<div class="vehicle-bottom"><div><small>Illustrative price</small><strong><?php echo esc_html(bwy_money($v['price'])); ?></strong></div><a aria-label="View details" href="<?php the_permalink(); ?>" class="round-arrow">↗</a></div>
</div></article>