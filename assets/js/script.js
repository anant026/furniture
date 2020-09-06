$(function () {
	var products = [],
		filters = {};
		

	var checkboxes = $('.all-products input[type=checkbox]');

	checkboxes.click(function () {

		var that = $(this),
			specName = that.attr('name');
			
		if(that.is(":checked")) {
			if(!(filters[specName] && filters[specName].length)){
				filters[specName] = [];
			}

			filters[specName].push(that.val());

			createQueryHash(filters);

		}

		if(!that.is(":checked")) {

			if(filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)){		
				var index = filters[specName].indexOf(that.val());
				filters[specName].splice(index, 1);
				if(!filters[specName].length){
					delete filters[specName];
				}

			}

			
			createQueryHash(filters);
		}
	});
	$('.filters button').click( (e) =>{
		e.preventDefault();
		window.location.hash = '#';
	});



	let singleProductPage = $('.single-product');

	singleProductPage.on('click',  (e) => {

		if (singleProductPage.hasClass('visible')) {

			let clicked = $(e.target);
			if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
				createQueryHash(filters);
			}

		}

	});



	// Get data about our products from products.json.
	$.getJSON( "products.json", ( data )=> {
		products = data;
		generateAllProductsHTML(products);
		$(window).trigger('hashchange');
	});

	$(window).on('hashchange', ()=>{
		render(decodeURI(window.location.hash));
	});


	// Navigation

	function render(url) {
		let temp = url.split('/')[0];
		$('.main-content .page').removeClass('visible');


		let	map = {
			'': ()=> {
				filters = {};
				checkboxes.prop('checked',false);

				allProductRender(products);
			},

			'#product': ()=> {
				const index = url.split('#product/')[1].trim();

				singleProductRender(index, products);
			},

			'#filter': ()=> {

				url = url.split('#filter/')[1].trim();
				try {
					filters = JSON.parse(url);
				}
				catch(err) {
					window.location.hash = '#';
					return;
				}

				renderFilterResults(filters, products);
			}

		};

		if(map[temp]){
			map[temp]();
		}
		else {
			renderErrorPage();
		}

	}

	function generateAllProductsHTML(data){

		let list = $('.all-products .products-list');

		let theTemplateScript = $("#products-template").html();
		let theTemplate = Handlebars.compile (theTemplateScript);
		list.append (theTemplate(data));

		list.find('li').on('click', function (e) {
			e.preventDefault();

			const productIndex = $(this).data('index');

			window.location.hash = 'product/' + productIndex;
		})
	}

	function allProductRender(data){

		let page = $('.all-products'),
			allProducts = $('.all-products .products-list > li');
		allProducts.addClass('hidden');
		allProducts.each(function () {
			
			data.forEach( (item) => {
				if($(this).data('index') == item.id){
					$(this).removeClass('hidden');
				}
			});
		});

		page.addClass('visible');

	}


	function singleProductRender(index, data){

		var page = $('.single-product'),
			pageContainer = $('.preview-large');
		if(data.length){
			data.forEach( (item) => {
				if(item.id == index){
					pageContainer.find('h3').text(item.name);
					pageContainer.find('img').attr('src', item.image.large);
					pageContainer.find('p').text(item.description);
					pageContainer.find('button').text("Buy Now");
					pageContainer.find('h5').text(item.price+"$");
				}
			});
		}

		// Show the page.
		page.addClass('visible');

	}

	function renderFilterResults(filters, products){

		var criteria = ['manufacturer','capacity','color'],
			results = [],
			isFiltered = false;

		checkboxes.prop('checked', false);


		criteria.forEach(function (c) {

			if(filters[c] && filters[c].length){

				if(isFiltered){
					products = results;
					results = [];
				}

				filters[c].forEach( (filter) => {
					products.forEach( (item) =>{

						if(typeof item.specs[c] == 'number'){
							if(item.specs[c] == filter){
								results.push(item);
								isFiltered = true;
							}
						}

						if(typeof item.specs[c] == 'string'){
							if(item.specs[c].toLowerCase().indexOf(filter) != -1){
								results.push(item);
								isFiltered = true;
							}
						}

					});
					if(c && filter){
						$('input[name='+c+'][value='+filter+']').prop('checked',true);
					}
				});
			}

		});
		allProductRender(results);
	}


	// Shows the error page.
	function renderErrorPage(){
		var page = $('.error');
		page.addClass('visible');
	}

	function createQueryHash(filters){

		if(!$.isEmptyObject(filters)){
			window.location.hash = '#filter/' + JSON.stringify(filters);
		}
		else{
			window.location.hash = '#';
		}

	}
	

});