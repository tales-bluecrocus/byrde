<?php
$title = get_sub_field('title');
$description = get_sub_field('description');
$locations = get_sub_field('locations');
$section_theme = get_sub_field('section_theme');
$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

$classes = array('areas-we-serve');
if ($section_theme) {
    $classes[] = $section_theme;
}
$section_id_attr = $section_id ? 'id="' . esc_attr($section_id) . '"' : '';
if ($section_class) $classes[] = $section_class;
?>

<section class="<?php echo esc_attr(implode(' ', $classes)); ?>" <?php echo $section_id_attr; ?>>
	<div class="areas-we-serve__container">
		<?php if ($title): ?>
			<h2 class="areas-we-serve__title"><?php echo esc_html($title); ?></h2>
		<?php endif; ?>
		<?php if ($description): ?>
			<p class="areas-we-serve__description">
				<?php echo esc_html($description); ?>
			</p>
		<?php endif; ?>
		
		<?php if ($locations): ?>
			<ul class="areas-we-serve__locations" id="areasWeServeList">
				<?php foreach ($locations as $item): ?>
					<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> <?php echo esc_html($item['location']); ?></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
</section>

<script>
	// Simple interaction: highlight city on hover
	document.addEventListener('DOMContentLoaded', function() {
		const items = document.querySelectorAll('.areas-we-serve__location');
		items.forEach(item => {
			item.addEventListener('mouseenter', () => {
				item.classList.add('is-active');
			});
			item.addEventListener('mouseleave', () => {
				item.classList.remove('is-active');
			});
		});
	});
</script>
