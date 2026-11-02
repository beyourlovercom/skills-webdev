<?php
if (!defined('ABSPATH')) exit;
define('BWY_THEME_VERSION','0.2.1');
add_action('after_setup_theme',function(){
 add_theme_support('title-tag'); add_theme_support('post-thumbnails'); add_theme_support('html5',['search-form','gallery','caption']);
 register_nav_menus(['primary'=>'Main Navigation']);
});
add_action('wp_enqueue_scripts',function(){
 wp_enqueue_style('bwy-style',get_stylesheet_uri(),[],BWY_THEME_VERSION);
 wp_enqueue_script('bwy-interactions',get_template_directory_uri().'/assets/site.js',[],BWY_THEME_VERSION,true);
});
add_action('init',function(){
 register_post_type('vehicle',[
  'label'=>'Vehicles','labels'=>['name'=>'Vehicles','singular_name'=>'Vehicle','add_new_item'=>'Add Vehicle'],
  'public'=>true,'has_archive'=>true,'rewrite'=>['slug'=>'vehicles','with_front'=>false],
  'supports'=>['title','editor','thumbnail','excerpt'],'show_in_rest'=>true,'menu_icon'=>'dashicons-truck',
 ]);
});
function bwy_vehicle_data($id){
 $names=['brand','model','year','mileage','price','axle','transmission','emission','category','condition','reference'];
 $result=[];foreach($names as $n)$result[$n]=get_post_meta($id,'bwy_'.$n,true);
 return $result;
}
function bwy_money($n){return '$'.number_format((float)$n,0);}
function bwy_vehicle_image($classes=''){
 return '<img class="'.esc_attr($classes).'" src="'.esc_url(get_template_directory_uri().'/assets/vehicle.svg').'" alt="Original demonstration vehicle illustration" loading="lazy" width="860" height="460">';
}
function bwy_pilot_notice(){
 echo '<div class="pilot-notice" role="status"><span class="pilot-dot"></span><strong>LOCAL DESIGN PREVIEW</strong><span>All vehicles, prices and articles are fictional test content. No live purchasing or enquiries.</span></div>';
}
function bwy_seed_local(){
 if(wp_parse_url(home_url(),PHP_URL_HOST)!=='localdev.basworldy.com' || get_option('bwy_local_seed_v02'))return;
 $pages=[
  ['Home','home','Local homepage layout and vehicle discovery.'],
  ['About Us','about-us','An independent B2B marketplace concept for commercial vehicles. This page is a content-layout preview; no company credentials, fleet ownership or customer claims are asserted.'],
  ['How to Buy','how-to-buy','Step 1: Compare vehicle information. Step 2: Request verified details. Step 3: Confirm inspection, terms and logistics directly with the seller before committing.'],
  ['Transport & Export','transport-export','International delivery workflows may include inspection, documentation, freight quotes, customs and destination handling. All services require separate verification.'],
  ['Contact','contact','Contact form and sales-channel integrations are intentionally disabled in this local design preview. No submissions are collected or transmitted.'],
  ['Insights','insights','Editorial index placeholder.'],
 ];
 $ids=[];
 foreach($pages as [$title,$slug,$content]){
  $exists=get_page_by_path($slug,OBJECT,'page');
  $ids[$slug]=$exists?$exists->ID:wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_title'=>$title,'post_name'=>$slug,'post_content'=>$content],true);
 }
 $rows=[
  ['Atlas HX 520 6X4 Tipper','atlas-hx-520',['brand'=>'Atlas','model'=>'HX 520','year'=>'2021','mileage'=>'124000','price'=>'62500','axle'=>'6X4','transmission'=>'Automatic','emission'=>'Euro 6','category'=>'Tipper truck','condition'=>'Used','reference'=>'DEMO-001']],
  ['Nord Transit 410 Tractor Unit','nord-transit-410',['brand'=>'Nord','model'=>'Transit 410','year'=>'2019','mileage'=>'386000','price'=>'28900','axle'=>'4X2','transmission'=>'Automatic','emission'=>'Euro 5','category'=>'Tractor unit','condition'=>'Used','reference'=>'DEMO-002']],
  ['Atlas Fleet 280 Box Truck','atlas-fleet-280',['brand'=>'Atlas','model'=>'Fleet 280','year'=>'2023','mileage'=>'42000','price'=>'45000','axle'=>'4X2','transmission'=>'Manual','emission'=>'Euro 6','category'=>'Box truck','condition'=>'Used','reference'=>'DEMO-003']],
  ['Ridge Haul 460 Flatbed','ridge-haul-460',['brand'=>'Ridge','model'=>'Haul 460','year'=>'2017','mileage'=>'550000','price'=>'23500','axle'=>'6X4','transmission'=>'Manual','emission'=>'Euro 4','category'=>'Flatbed truck','condition'=>'Used','reference'=>'DEMO-004']]
 ];
 foreach($rows as [$title,$slug,$meta]){
  $exists=get_page_by_path($slug,OBJECT,'vehicle');
  $id=$exists?$exists->ID:wp_insert_post(['post_type'=>'vehicle','post_title'=>$title,'post_name'=>$slug,'post_status'=>'publish','post_content'=>'Fictitious example listing created for local template validation. Specifications are synthetic and must not be treated as a real offer.','post_excerpt'=>'Illustrative technical specification · local preview only.'],true);
  if(!is_wp_error($id))foreach($meta as $key=>$val)update_post_meta($id,'bwy_'.$key,$val);
 }
 $posts=[
  ['Understanding 6X4 and 4X2 axle configurations','understanding-axle-configurations','Axle layouts influence payload requirements, road conditions and maintenance. This educational article is a local design placeholder; always verify manufacturer specifications for any real vehicle.'],
  ['A practical checklist for inspecting a used truck','used-truck-inspection-checklist','Inspect service history, mileage evidence, driveline condition, emissions compliance, frame, brakes and documentation. This editorial template is illustrative and not a professional inspection report.'],
  ['Preparing vehicle export documents','preparing-export-documents','Export documentation varies across jurisdictions. Confirm bills of sale, title, customs and shipping requirements with qualified providers before a transaction.'],
 ];
 foreach($posts as [$title,$slug,$text]){
  if(!get_page_by_path($slug,OBJECT,'post'))wp_insert_post(['post_type'=>'post','post_status'=>'publish','post_title'=>$title,'post_name'=>$slug,'post_content'=>str_repeat('<p>'.esc_html($text).'</p>',3),'post_excerpt'=>$text]);
 }
 if(!is_wp_error($ids['insights'])){
  update_option('show_on_front','page');
  update_option('page_on_front',$ids['home']);
  update_option('page_for_posts',$ids['insights']);
 }
 update_option('blog_public','0');
 update_option('bwy_local_seed_v02',true,false);
 flush_rewrite_rules(false);
}
add_action('after_switch_theme','bwy_seed_local');