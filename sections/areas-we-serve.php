<section class="areas-we-serve">
	<div class="areas-we-serve__container">
		<h2 class="areas-we-serve__title">Proudly Serving Local Communities</h2>
		<p class="areas-we-serve__description">
			We provide fast, reliable junk removal throughout Sacramento County, Placer County, and El Dorado County.
		</p>
		<ul class="areas-we-serve__locations" id="areasWeServeList">
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Roseville, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Rocklin, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Lincoln, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Granite Bay, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Loomis, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Auburn, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Sacramento, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Citrus Heights, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Folsom, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Rancho Cordova, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> El Dorado Hills, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Placerville, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Cameron Park, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Fair Oaks, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Antelope, CA</li>
			<li class="areas-we-serve__location"><span><i class="ph ph-map-pin"></i></span> Orangevale, CA</li>
		</ul>
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
