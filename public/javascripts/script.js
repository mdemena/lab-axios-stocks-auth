async function printTheChart(symbolName) {
	const key = 'UBKY9YCP2IW6L5D2';
	const functionName = 'TIME_SERIES_DAILY';
	//const symbolName = 'MSFT';
	const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbolName}&apikey=${key}`;

	try {
		const responseFromAPI = await axios.get(apiUrl);
		console.log(responseFromAPI);
		const stockData = responseFromAPI.data;

		const dailyData = stockData['Time Series (Daily)'];

		const stockDates = Object.keys(dailyData);
		const stockPrices = stockDates.map((date) => dailyData[date]['4. close']);

		const ctx = document.getElementById('stock-chart').getContext('2d');
		const chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: stockDates,
				datasets: [
					{
						label: 'Stock Chart ' + symbolName,
						backgroundColor: 'rgb(255, 99, 132)',
						borderColor: 'rgb(255, 99, 132)',
						data: stockPrices,
					},
				],
			},
		});
	} catch (err) {
		console.log('Error while getting the data: ', err);
	}
}

async function searchSymbol(keywords) {
	const key = 'UBKY9YCP2IW6L5D2';
	const functionName = 'SYMBOL_SEARCH';
	const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&keywords=${keywords}&apikey=${key}`;

	try {
		const responseFromAPI = await axios.get(apiUrl);
		return responseFromAPI.data['bestMatches'];
	} catch (err) {
		console.log('Error while getting the data: ', err);
	}
}

function autocomplete(inp) {
	var currentFocus;
	inp.addEventListener('input', async function (e) {
		var a,
			b,
			i,
			val = this.value;

		closeAllLists();
		if (!val || val.length < 4) {
			return false;
		}
		arr = await searchSymbol(val);
		console.log(arr);
		currentFocus = -1;

		a = document.createElement('DIV');
		a.setAttribute('id', this.id + 'autocomplete-list');
		a.setAttribute('class', 'autocomplete-items');

		this.parentNode.appendChild(a);

		for (i = 0; i < arr.length; i++) {
			if (
				arr[i]['2. name'].substr(0, val.length).toUpperCase() ==
				val.toUpperCase()
			) {
				b = document.createElement('DIV');

				b.innerHTML =
					'<strong>' + arr[i]['2. name'].substr(0, val.length) + '</strong>';
				b.innerHTML +=
					arr[i]['2. name'].substr(val.length) +
					'(' +
					arr[i]['1. symbol'] +
					')';

				b.innerHTML +=
					"<input type='hidden' value='" + arr[i]['1. symbol'] + "'>";
				b.innerHTML +=
					"<input type='hidden' value='" + arr[i]['2. name'] + "'>";
				b.addEventListener('click', function (e) {
					inp.value = this.getElementsByTagName('input')[1].value;
					document.getElementById('symbolId').value = this.getElementsByTagName(
						'input'
					)[0].value;

					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});

	inp.addEventListener('keydown', function (e) {
		var x = document.getElementById(this.id + 'autocomplete-list');
		if (x) x = x.getElementsByTagName('div');
		if (e.keyCode == 40) {
			currentFocus++;

			addActive(x);
		} else if (e.keyCode == 38) {
			currentFocus--;

			addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		if (!x) return false;

		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = x.length - 1;

		x[currentFocus].classList.add('autocomplete-active');
	}
	function removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove('autocomplete-active');
		}
	}
	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName('autocomplete-items');
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}

	document.addEventListener('click', function (e) {
		closeAllLists(e.target);
	});
}
