function setNavBarHeight() {
	// .outerHeight() includes padding. 
	var navBarHeight = ($('#navBar').outerHeight()).toString() + 'px';
	var navBarSpacerEl = $('.navBarSpacer').css('height', navBarHeight);
	console.log("navBarHeight", navBarHeight);
	console.log('navBarSpacerEl height', navBarSpacerEl.height());
}

window.onload = function () {
	setNavBarHeight();
}