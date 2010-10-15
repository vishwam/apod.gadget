var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
var apodDomain = "http://apod.nasa.gov";
var apodURL = "http://apod.nasa.gov/apod/";
var titleRegex = new RegExp ("<title>(.*)", "i");
var imgRegex = new RegExp ("(?:src=\")(image\/.*)(?:\")", "i");
var cssPixelRegex = /^(\d+)px$/
var refreshRate = 5000; //86400000; // 1 Day
var timeoutID;
var defaultPicture = "http://apod.nasa.gov/apod/image/1008/abell1689_hst.jpg";

function getAPOD()
{
	xmlhttp.open ("GET", apodURL, true);
	xmlhttp.onreadystatechange=checkResponse;
	xmlhttp.send(null);
}

function checkResponse()
{
	if (xmlhttp.readyState == 4)
	if (xmlhttp.status==200)
	{
		parseResponse();
		// timeoutID = setTimeout ("getAPOD()", refreshRate);
	}
	else
	{
		showError(
			"<p><b>Error accessing APoD website</b></p>"+
			"<p>Status Returned: "+
			xmlhttp.status +
			" "+
			xmlhttp.statusText+
			"</p>"
		);
	}
}

function getImage (link) 
{
debugger;
	var image = new Image();
	image.src = link;
	
	var picH = image.height;
	var picW = image.width;
	var maxH = 320;
	var maxW = 240;
	
	var newH, newW, nTop, nLeft;
	
	if (picW > picH) {
		if (picW > maxW) {
			newW = maxW;
			newH = picH*maxW/picW;
		}
		nTop = (maxH-newH)/2;
		nLeft = 0;
	} else {
		if (picH > maxH) {
			newH = maxH;
			newW = picW*maxH/picH;
		}
		nLeft = (maxW-newW)/2;
		nTop = 0;
	}
	
	with (picture.style)
		top=nTop, left=nLeft,height=newH,width=newW;
		
	picture.src = link;
}
	

function parseResponse ()
{
	var img = imgRegex.exec(xmlhttp.responseText);
	if (img) {
		picture.src = apodURL.concat (img[1]);
		picture.alt = parseTitle();
		
		// set explanation:
		// Explanations begin after the image, and preceded by a <center> tag.
		var explnIndex = xmlhttp.responseText.indexOf("<center>", img.lastIndex);
		if (explnIndex >= 0) 
		{
			explanation.innerHTML =  xmlhttp.responseText.substr (explnIndex);
			correctLocalHrefs();
		} else 
		{
			showError ("<p><b>Error parsing APoD Explanation</b></p>");
		}
	} else {
		showError ("<p><b>Error parsing APoD website</b></p>");
	}
}

function parseTitle () 
{
	var title = titleRegex.exec(xmlhttp.responseText);
	if (title) return title[1];
	else return "";
}

/**Change all non-fully-specified hyperlinks 
 * (e.g. "/apod.rss" instead of "http://apod.nasa.gov/apod.rss")
 * to point to their correct location.
 */
function correctLocalHrefs ()
{
	var protocol = "x-gadget://";
	var curDir = location.pathname.substring (0,location.pathname.lastIndexOf("/"));
	var apodDir = apodURL.substring (0,apodURL.lastIndexOf("/"));
	
	// get all anchors
	var anchors = document.getElementsByTagName("a");
	for (i=0; i<anchors.length; i++)
	{
		// test only for hrefs that begin with specified protocol:
		if (anchors[i].href.indexOf(protocol) < 0) continue;
		
		if (anchors[i].href.indexOf(curDir) < 0) 
		{
			 // target pathname is specified using root ("/apod.rss")
			 // ("file:///C:/apod.rss" -> "/apod.rss" -> "http://apod.nasa.gov/apod.rss")
			var root = anchors[i].href.indexOf("/", protocol.length+1); // "file:///C:"
			anchors[i].href = apodDomain + anchors[i].href.substr (root);
		}
		else 
		{
			// target is in the current directory or its children
			var subDir = anchors[i].href.substr (protocol.length+curDir.length)
			anchors[i].href = apodDir + subDir;
		}
	}
}

function showError (html)
{
	picture.src = defaultPicture;
	picture.alt = "Astronomy Picture of the Day";
	explanation.innerHTML = html;
}

function toggleFlyout () 
{
	System.Gadget.Flyout.Show ^= true;
}

function setStyles()
{
	with(document.body.style)
		width=360, 
		height=280;
		
	with(background.style)
		width=360, 
		height=280;
	
	with(pictureFrame.style)
		top=16,left=17,width=320, height=240;
	
	with(picture.style)
		width=320,height=240;
}

function main()
{
	// set flyout root
	System.Gadget.Flyout.file = "flyout.html";
	
	setStyles();
	background.src="url(images/background_frame.png)";
	picture.src = defaultPicture;
	getAPOD();
}
