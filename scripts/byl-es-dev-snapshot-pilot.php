<?php
/**
 * BYL Spanish Editorial V2 — read-only Dev pilot snapshot exporter.
 * The only file write is a private audit JSON; no WordPress DB or page mutation.
 */
$requestedBase=(string)getenv('BYL_ES_V2_PRIVATE_DIR');
$resolvedBase=$requestedBase!==''?realpath($requestedBase):false;
if(!$resolvedBase || !str_contains($resolvedBase,'/.byl-private/translatepress/seo-gate') || str_starts_with($resolvedBase,ABSPATH))die("STOP_PRIVATE_PATH\n");
$base=rtrim($resolvedBase,'/').'/';
if(get_option('siteurl')!=='https://dev.beyourlover.com' ||
   (string)get_option('blog_public')!=='0' ||
   get_option('byl_trp_seo_gate_enabled')!=='yes') die("STOP_DEV_SCOPE\n");
$pid=(int)(getenv('BYL_ES_V2_POST_ID')?:38305);
$pilot=[
38305=>['en'=>'how-to-get-horny','es'=>'deseo-sexual-como-estimularlo-sin-presion'],
38348=>['en'=>'bdsm-sexting','es'=>'sexting-bdsm-consentimiento-privacidad'],
38395=>['en'=>'footjob','es'=>'guia-contacto-intimo-pies-seguridad'],
38427=>['en'=>'how-to-use-a-dildo-for-men','es'=>'guia-dildos-hombres-uso-seguro'],
38547=>['en'=>'pubic-haircuts-for-men','es'=>'estilos-vello-pubico-masculino-guia-segura'],
38587=>['en'=>'how-to-choose-the-best-lube','es'=>'lubricantes-intimos-compatibilidad-seguridad'],
38607=>['en'=>'types-of-orgasms','es'=>'tipos-orgasmo-sensaciones-seguridad'],
38628=>['en'=>'best-oral-sex-toys','es'=>'siete-juguetes-sexo-oral-guia']
];
if(!isset($pilot[$pid]))die("STOP_NOT_PILOT\n");
$p=get_post($pid);
if(!$p || $p->post_status!=='publish' || $p->post_name!==$pilot[$pid]['en'] || !byl_trp_post_review($pid,'es_ES'))die("STOP_POST_OR_R9\n");
$sha=byl_trp_source_hash($p);
$packet=json_decode(file_get_contents($base."R2-batch2-r2-packets-20261114/$pid-es_ES.json"),true);
if(!$packet||$packet['source_sha256']!==$sha)die("STOP_SOURCE_SHA_DRIFT\n");
function byl_v2_html($url){
    $r=wp_remote_get($url,['timeout'=>35,'redirection'=>0,'headers'=>['Cache-Control'=>'no-cache']]);
    if(is_wp_error($r)||wp_remote_retrieve_response_code($r)!==200)die("STOP_HTTP\n");
    $doc=new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8"?>'.wp_remote_retrieve_body($r));
    libxml_clear_errors();
    $xp=new DOMXPath($doc);
    $nodes=$xp->query('//*[contains(concat(" ",normalize-space(@class)," ")," byl-post-single__content ")]');
    if($nodes->length!==1)die("STOP_CONTENT_SELECTOR\n");
    $html='';foreach($nodes->item(0)->childNodes as $node)$html.=$doc->saveHTML($node);
    $titles=$xp->query('//title');$meta=$xp->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]');
    return ['html'=>$html,'title'=>$titles->length?$titles->item(0)->textContent:'',
            'meta'=>$meta->length?$meta->item(0)->getAttribute('content'):''];
}
$source=byl_v2_html('https://dev.beyourlover.com/blog/'.$pilot[$pid]['en'].'/');
$target=byl_v2_html('https://dev.beyourlover.com/es/blog/'.$pilot[$pid]['es'].'/');
$dictionary=$GLOBALS['wpdb']->prefix.'trp_dictionary_en_us_es_es';
$wpdb=$GLOBALS['wpdb'];
$keys=[];
foreach($packet['blocks'] as $block)foreach($block['segments']??[] as $seg){
    $key=trim((string)($seg['en']??''));if($key!=='')$keys[$key]=true;
    $variant=wptexturize($key);if($variant!==$key)$keys[$variant]=true;
}
foreach([$source['html']] as $htmlBody){
    $dom=new DOMDocument();libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8"?><main>'.$htmlBody.'</main>');
    libxml_clear_errors();
    $xp=new DOMXPath($dom);
    foreach($xp->query('//p//text() | //li//text() | //h1//text() | //h2//text() | //h3//text()') as $node){
        $key=trim($node->textContent);if($key!=='')$keys[$key]=true;
        $formatted=wptexturize($key);if($formatted!==$key)$keys[$formatted]=true;
    }
}
if(count($keys)>1200)die("STOP_KEYS_OVER_LIMIT\n");
$rows=[];$seen=[];
foreach(array_keys($keys) as $key){
    $result=$wpdb->get_results($wpdb->prepare("SELECT id,original,translated,status FROM $dictionary WHERE BINARY original=BINARY %s LIMIT 4",$key),ARRAY_A);
    foreach($result as $row){
        if(isset($seen[$row['id']]))continue;$seen[$row['id']]=true;
        $rows[]=['original'=>$row['original'],'translated'=>$row['translated'],'status'=>(int)$row['status']];
    }
}
$approved_localizations=[];
if($pid===38587){
    $linked=get_post(38305);
    if($linked && $linked->post_status==='publish'
       && $linked->post_name==='how-to-get-horny'
       && byl_trp_post_review(38305,'es_ES')){
        $approved_localizations[]=[
            'en'=>'/blog/how-to-get-horny/',
            'es'=>'/es/blog/deseo-sexual-como-estimularlo-sin-presion/'
        ];
    }
}
$payload=[
    'approved_link_localizations'=>$approved_localizations,
    'post_id'=>$pid,'source_hash'=>$sha,
    'en_html'=>$source['html'],'es_html'=>$target['html'],
    'dictionary'=>$rows,'packet'=>['blocks'=>$packet['blocks']],
    'seo'=>['title_es'=>$target['title'],'meta_es'=>$target['meta']],
    'preserve_terms'=>['BeYourLover','Skull Man','Pink Naughty Clock','Medical News Today','Planned Parenthood','WebMD','Healthline','SELF'],
    'snapshot_type'=>'DEV_READ_ONLY_RENDER',
    'source_url'=>'https://dev.beyourlover.com/blog/'.$pilot[$pid]['en'].'/',
    'target_url'=>'https://dev.beyourlover.com/es/blog/'.$pilot[$pid]['es'].'/',
    'www_writes'=>0,'google_calls'=>0
];
$filename=$base."BYL_ES_V2_R1_snapshot_".$pid."_20261115.json";
if(file_put_contents($filename,wp_json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX)===false)die("STOP_PRIVATE_SNAPSHOT_WRITE\n");
chmod($filename,0600);
echo "SNAPSHOT_READ_ONLY=PASS PID=$pid SHA=$sha EN_BYTES=".strlen($source['html'])." ES_BYTES=".strlen($target['html'])." DICT_ROWS=".count($rows)." FILE=$filename WWW=0 GOOGLE=0\n";
