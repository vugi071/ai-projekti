// Use static figure definitions from figureDefinitions.js
function loadFigureDefinitions() {
    // Return the global figureDefinitions from figureDefinitions.js
    return window.figureDefinitions || {};
}

// Initialize figure definitions
let figureDefinitions = loadFigureDefinitions();

// Initialize colors and font size on page load
function initializeColors() {
    updateColors('#C0C0C0');
    updateBackgroundColor('#1a5983');
    
    // Set initial figures to none (will be set by loadFigureOptions if available)
    updateFigure('left', 'none');
    updateFigure('right', 'none');
    
    // Set initial font size for default text
    const textElement = document.getElementById('custom-text');
    const defaultText = 'YOUR NAME';
    if (textElement && defaultText.length <= 7) {
        textElement.style.fontSize = '50px';
    }
}

// Update text in real-time with dynamic font scaling
document.getElementById('name-input').addEventListener('input', function(e) {
    const text = e.target.value || 'YOUR NAME';
    const textElement = document.getElementById('custom-text');
    textElement.textContent = text.toUpperCase();
    
    // Dynamic font scaling for text longer than 7 characters
    const textLength = text.length;
    let fontSize = 50; // Base font size from CSS
    
    if (textLength > 7) {
        // Calculate proportional font size reduction
        const scaleFactor = 7 / textLength;
        fontSize = Math.max(fontSize * scaleFactor, 20); // Minimum 20px
    }
    
    textElement.style.fontSize = fontSize + 'px';
    
    // Keep text at consistent baseline position regardless of font size
    textElement.style.lineHeight = '1';
    textElement.style.alignItems = 'baseline';
});

// Color picker functionality
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove active class from all options
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        this.classList.add('active');
        
        // Update colors
        const selectedColor = this.getAttribute('data-color');
        updateColors(selectedColor);
    });
});

// Background color picker functionality
document.getElementById('bg-color-picker').addEventListener('input', function(e) {
    const selectedColor = e.target.value;
    updateBackgroundColor(selectedColor);
});

// Update SVG and text colors
function updateColors(color) {
    // Update all SVG fill colors
    const svgElements = document.querySelectorAll('.svg-element');
    svgElements.forEach(element => {
        element.style.fill = color;
    });
    
    // Update text color
    const textElement = document.getElementById('custom-text');
    if (textElement) {
        textElement.style.color = color;
    }
    
    // Update figure colors by re-rendering them
    const leftActiveFigure = document.querySelector('#left-figure-menu .figure-option.active')?.getAttribute('data-figure');
    const rightActiveFigure = document.querySelector('#right-figure-menu .figure-option.active')?.getAttribute('data-figure');
    
    if (leftActiveFigure && leftActiveFigure !== 'none') {
        updateFigure('left', leftActiveFigure);
    }
    if (rightActiveFigure && rightActiveFigure !== 'none') {
        updateFigure('right', rightActiveFigure);
    }
}

// Update background color
function updateBackgroundColor(color) {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
        previewContainer.style.backgroundImage = 'none';
        previewContainer.style.backgroundColor = color;
    }
}

// Download functionality - generates SVG file
function downloadDesign() {
    // Get current colors and text
    const currentText = document.getElementById('custom-text').textContent;
    const currentColor = document.querySelector('.color-option.active').getAttribute('data-color');
    const currentBgColor = document.getElementById('bg-color-picker').value;
    
    // Create SVG content
    const svgContent = createSVGDesign(currentText, currentColor, currentBgColor);
    
    // Create download link
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medal-hanger-${currentText.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Create SVG design for download - matches screen layout exactly
function createSVGDesign(text, color, bgColor) {
    const textLength = text.length;
    let fontSize = 50; // Scaled to match mm units
    if (textLength > 7) {
        const scaleFactor = 7 / textLength;
        fontSize = Math.max(fontSize * scaleFactor, 20);
    }
    
    // Calculate proportions based on 495mm width (like big-hanger.svg)
    const totalWidth = 495;
    const totalHeight = 280; // Proportional height
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="495mm" height="280mm" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" viewBox="0 0 ${totalWidth} ${totalHeight}">
    
    <!-- Player SVG (left top) - positioned to overlap with hanger like on screen -->
    <g transform="translate(40, 155) scale(1.2)">
        <path fill="${color}" d="M9.6954 74.6151c1.6444,-4.2936 0.9513,-2.232 0.9513,-6.9093 -0.1568,-2.9011 -0.5419,-9.9029 0.2832,-13.1 -1.7538,-1.323 -5.775,-4.092 -8.441,-6.3491 -8.3581,-5.4739 7.837,-15.0673 13.4837,-21.2762 0.6029,-0.9135 2.1925,-2.5305 2.3478,-3.5536 -0.0914,0 -0.1736,0 -0.2558,0 -0.8953,-2.8594 -3.17,-3.1517 -2.6584,-6.2212 -0.2558,-0.0822 -0.5116,-0.1644 -0.7674,-0.2466 -0.0274,-1.8271 -0.0456,-3.645 -0.0639,-5.463 0.1553,-0.1644 0.1553,-0.1644 0.5755,-0.2466 2.1742,-12.5154 16.9917,-15.5575 23.1581,-4.1931 0.5024,1.6535 0.6303,2.4117 0.7582,2.5396 0.0183,-0.0914 0.0366,-0.1736 0.064,-0.2558 0.2192,0.0274 0.4385,0.0548 0.6577,0.0913 1.215,2.2839 1.8179,4.4855 1.8179,7.016 0.3929,2.6492 1.6444,4.9605 2.0555,7.6371 0.475,0.137 1.4342,1.5073 2.0646,1.9458 5.335,6.4405 14.2419,8.8156 18.0788,16.4254 4.4132,5.8498 -6.2405,12.0978 -9.9534,14.5039 -5.6273,1.69 -4.453,2.2503 -7.3033,7.4483 -3.5113,4.4011 -3.8384,10.6295 -6.7704,10.592l-30.0827 -0.3849zm28.1654 -24.6684c0.4842,-1.5895 1.5165,-3.5262 1.7723,-5.0792 2.1742,0.1279 2.6401,-3.0512 2.5396,-4.8235 -0.475,-0.0822 -0.7308,0.0731 -0.8861,0.5116 -0.0914,0 -0.1736,0 -0.2558,0 4.6316,-13.1549 -14.9454,-17.6038 -16.1147,-2.7954 -0.1279,0 -0.2558,0 -0.3746,0 -0.4933,1.6352 -0.0274,3.5537 0.1827,5.2072 0.4842,0.3288 0.6121,0.2923 1.2059,0.2557 -0.0457,1.9824 -0.4202,3.8552 -0.5024,5.8284 -1.215,-0.3563 -1.891,-2.1742 -3.8095,-2.6584 -1.5164,-3.0421 -6.9245,-2.768 -7.6736,-5.0153 2.2016,-3.1517 3.8185,-7.6645 6.687,-10.058 2.0098,-2.5031 3.7272,-3.7455 6.0659,-5.8009 0.9683,0 2.4208,0.2375 3.1699,-0.5116 -0.0456,-0.0457 -0.0913,-0.0822 -0.1279,-0.1188 1.8819,-0.3014 3.6999,-0.2375 5.6091,-0.2284 1.3886,2.9234 3.5628,3.6816 5.938,5.8101 5.5634,4.0378 8.1852,9.3181 12.9082,14.041 -2.6036,0.4751 -4.2296,1.4343 -6.1846,3.2157 -2.8045,0 -4.3027,0.3745 -6.5957,2.028 -1.5256,0 -1.5256,0 -3.5537,0.1918z"/>
    </g>
    
    <!-- Ball SVG (right top) - positioned to overlap with hanger like on screen -->
    <g transform="translate(380, 165) scale(1.0)">
        <path fill="${color}" d="M113.646 58.4799l0 -3.7849 -0.0798 -0.3983c-0.0561,-0.1404 -0.097,-1.0996 -0.1312,-1.8818 -0.0162,-0.4156 -0.0328,-0.7888 -0.0561,-1.0417 -0.1449,-1.5585 -0.3496,-3.1033 -0.6121,-4.6027 -0.2596,-1.4856 -0.5814,-2.9683 -0.9642,-4.4228 -0.9536,-3.6188 -2.1615,-6.9166 -3.6572,-10.0443 -1.4979,-3.1342 -3.272,-6.0766 -5.3535,-8.985l-0.0021 0.0011c-0.5363,-0.7494 -1.656,-2.183 -2.7248,-3.4654 -0.8368,-1.0044 -1.6514,-1.9248 -2.1512,-2.3713 -0.2036,-0.1814 -0.3676,-0.3524 -0.5454,-0.5366l-0.0025 0.0018 -0.2737 -0.2864c-0.151,-0.1528 -0.2784,-0.2731 -0.4026,-0.3902 -0.1429,-0.135 -0.2847,-0.2681 -0.4169,-0.407l-0.0046 -0.0043c-0.5838,-0.6092 -1.1013,-1.0608 -1.7004,-1.584l-0.164 -0.144 -0.1474 -0.1288c-0.6004,-0.526 -1.1226,-0.9832 -1.7544,-1.4912 -5.1555,-4.1357 -10.9549,-7.3506 -17.1998,-9.4853 -6.0883,-2.0821 -12.607,-3.1365 -19.3719,-3.0184 -15.384,0.2707 -29.3266,6.7128 -39.3963,16.9861 -10.0136,10.2154 -16.2025,24.2176 -16.1802,39.7089 0.0075,5.388 0.7665,10.5958 2.1756,15.5258l5.3216 0c-0.1845,-0.5843 -0.3626,-1.1748 -0.5313,-1.7742 0.5161,-0.8308 1.3285,-1.9368 2.1911,-3.0124 0.8989,-1.1218 1.8337,-2.1861 2.5357,-2.8649l0.0036 0c0.158,-0.1539 0.3055,-0.2999 0.4448,-0.4382 0.2307,-0.2278 0.4403,-0.4353 0.6308,-0.6102l0 0.0006 3.496 -3.06 0.0022 0.0022c1.8588,-1.5215 3.9183,-3.0339 6.0568,-4.4779 2.2845,-1.5427 4.6464,-2.9994 6.9378,-4.2962 5.6973,-3.2248 11.9578,-6.2548 18.4401,-8.8988 6.2509,-2.5489 12.6891,-4.7301 19.0078,-6.3715 1.3073,-0.3391 5.8039,-1.4252 9.5268,-2.1862 1.6972,-0.3461 3.2174,-0.6227 4.1547,-0.7256 0.392,1.0312 1.0145,3.0735 1.6059,5.1799 0.5839,2.0856 1.1257,4.2016 1.3731,5.4384l-0.144 0.0346c-0.2904,0.0673 -0.5631,0.1329 -0.7303,0.1845l0 0.0035c-2.0363,0.6166 -3.7931,1.5096 -5.4071,2.5809 -1.5833,1.051 -3.0336,2.2772 -4.4799,3.5856 -0.4297,0.3874 -1.1377,1.0852 -1.8084,1.7742 -0.6141,0.631 -1.2241,1.2837 -1.5907,1.7184 -1.7555,2.0877 -3.1256,3.8033 -4.434,5.5644 -1.3165,1.772 -2.5876,3.6086 -4.1373,5.9235 -1.5721,2.351 -2.0575,3.1151 -3.7173,5.7182 -2.4892,3.9045 1.0347,-1.221 -1.6806,2.6321l5.1226 0c2.8219,-4.1791 -1.6538,2.492 1.0253,-1.7776 1.1201,-1.7847 0.3221,-0.4915 1.4866,-2.2517 0.5934,-0.8964 1.1888,-1.7956 1.8807,-2.8568 0.2317,-0.3571 0.46,-0.7014 0.6707,-1.01 0.1965,-0.2901 0.4222,-0.6161 0.6713,-0.9667 1.0569,-1.4863 1.9103,-2.6734 2.8184,-3.8718 0.8838,-1.168 1.7988,-2.3164 2.9846,-3.7339 0.7701,-0.9186 1.5494,-1.7726 2.3558,-2.5858 0.8182,-0.8242 1.6681,-1.6151 2.5665,-2.3937 0.9842,-0.8558 2.6204,-2.0493 4.4344,-2.9877 0.9423,-0.4872 1.924,-0.9028 2.8733,-1.1568 0.0536,0.3196 0.1132,0.6484 0.1719,0.9765 0.0763,0.4287 0.1535,0.8544 0.2141,1.2428 0.2456,1.553 0.4611,3.2523 0.6414,4.9714 0.1869,1.7885 0.3309,3.5815 0.4248,5.2434 0.1858,3.2797 0.2338,6.6008 0.1249,9.9225 -0.1567,4.7699 0.0879,-0.4229 -0.7899,4.219l4.3069 0.0001c0.8166,-4.5935 0.557,0.6298 0.7116,-4.1349 0.2261,-6.929 -0.212,-13.9133 -1.2055,-20.6005 -0.0515,-0.3464 -0.137,-0.7938 -0.2247,-1.2608 -0.0677,-0.3556 -0.1383,-0.7243 -0.1955,-1.0686 3.7194,0.0028 6.6287,0.713 8.9416,2.0052 2.5188,1.4076 4.3642,3.5349 5.8074,6.2041 0.6965,1.2912 1.2675,2.7174 1.7273,4.2269 0.5034,1.6503 0.8777,3.4223 1.1444,5.2402l0.0366 0.2458c0.229,1.5537 0.5698,3.8634 0.2315,5.0945 -1.306,4.7568 0.7864,0.0956 -1.9604,4.2108l5.9908 -0.0001c2.4998,-4.3961 -0.0116,0.6413 1.2524,-4.227 0.3779,-1.4588 0.6978,-2.9481 0.9526,-4.4393 0.2585,-1.4994 0.4589,-3.0393 0.5969,-4.5841 0.0233,-0.261 0.0384,-0.623 0.0536,-1.023 0.0304,-0.7655 0.0677,-1.7026 0.1273,-1.8514l0.0766 -0.3952zm-29.0254 -45.3812c0.314,0.193 0.5994,0.374 0.8343,0.5292 -0.1076,0.134 -0.2304,0.2703 -0.3612,0.406 -0.4907,0.5084 -1.0685,0.9656 -1.4968,1.2267 -0.8308,0.5055 -1.7639,0.8724 -2.7482,1.136 -1.0054,0.2678 -2.068,0.429 -3.1386,0.5183l-0.4167 0.0427 -0.0049 -0.0002 0 0c-0.0678,-0.1101 -0.1535,-0.2494 -0.3091,-0.485 -0.3595,-0.5454 -0.7408,-1.0873 -1.1236,-1.6017 -0.4343,-0.5838 -0.8626,-1.13 -1.257,-1.6061 -1.3034,-1.5741 -2.7513,-3.1309 -4.3208,-4.5568 -1.0629,-0.9674 -2.1837,-1.8743 -3.3543,-2.6882l0.447 0.1002c2.9859,0.6816 6.1524,1.6552 7.9587,2.3325l0 0.0017c1.0287,0.3867 2.0105,0.7942 2.9552,1.2235 0.9408,0.429 1.8747,0.895 2.8103,1.3967 0.6012,0.3231 2.2575,1.242 3.5257,2.0245zm-16.3555 -0.5118c1.3403,1.3045 2.57,2.7217 3.7204,4.1999 -2.4331,-0.1916 -5.9839,-0.5858 -8.5563,-0.8718 -0.8149,-0.09 -1.5285,-0.1697 -2.2532,-0.2458 -4.396,-0.4615 -8.9765,-0.8767 -13.5746,-1.1061 -4.608,-0.2293 -9.2217,-0.2716 -13.6627,0.0127 -1.6094,0.1027 -3.2873,0.2635 -4.9647,0.4868 -1.0555,0.1404 -2.0994,0.3041 -3.114,0.4925 0.7418,-0.5605 1.4509,-1.0732 2.0024,-1.4577 3.634,-2.534 7.6271,-4.5557 11.865,-6.041 4.2732,-1.4965 8.7987,-2.4472 13.4616,-2.824 1.3155,-0.1069 2.9083,0.2328 4.4951,0.7764 2.226,0.7627 4.4112,1.9167 5.8752,2.8364 1.7238,1.0845 3.2791,2.3521 4.7058,3.7417l0 0zm17.0791 16.1551c-0.6145,0.0646 -1.2256,0.1299 -1.8224,0.1788l-1.9555 -4.4425 -0.0342 -0.0632 -1.8154 -3.4699c1.2231,-0.1771 2.3679,-0.4478 3.4538,-0.839 1.5656,-0.5637 2.9891,-1.3698 4.3315,-2.4948 0.5933,-0.4966 0.9817,-1.0057 1.3412,-1.5137 0.2846,0.2293 0.6075,0.5003 0.8544,0.7073 0.1031,0.0862 0.1803,0.152 0.3511,0.2896 1.0792,0.8739 2.0472,1.8256 3.0254,2.7874 0.2572,0.254 0.5172,0.509 0.7702,0.7542 0.4906,0.4767 1.0696,1.0943 1.6478,1.7427 0.6523,0.7316 1.2842,1.4842 1.7806,2.1068 0.5747,0.7232 1.8867,2.4836 2.9457,4.0542 0.1006,0.1485 0.1979,0.2949 0.2914,0.4377l-0.0244 -0.0049c-1.9195,-0.3217 -3.9899,-0.5055 -6.0757,-0.5783 -2.3008,-0.0808 -4.602,-0.0257 -6.7296,0.1263 -0.7653,0.0541 -1.5541,0.1384 -2.3359,0.2213zm-20.9015 -8.4639c3.4794,0.3873 7.0129,0.7817 10.5389,0.9024 0.0586,0.0971 0.1197,0.1944 0.1793,0.2889 0.0864,0.1394 0.1742,0.2798 0.2565,0.4227l0.0035 0c0.5453,0.949 1.8538,3.4266 2.893,5.6035 0.3511,0.7374 0.666,1.4231 0.8964,1.9756 -2.6214,0.3792 -5.8635,1.058 -9.138,1.8468 -4.6228,1.1131 -9.3067,2.4476 -12.3893,3.4806 -5.2539,1.7579 -10.2807,3.6424 -15.1515,5.7447 -4.8842,2.1064 -9.6407,4.4449 -14.3453,7.107 -2.5114,1.422 -5.5203,3.255 -8.3693,5.1801 -2.3549,1.5903 -4.6218,3.259 -6.4453,4.837l-0.0176 0.0165 -3.6763 3.3218 -0.0293 0.0254c-0.5652,0.5479 -1.1888,1.1928 -1.7836,1.8412l0 0.0035c-0.6064,0.6621 -1.1843,1.3251 -1.6489,1.8983l-0.0166 0.0214 -0.1121 0.1447c-0.2445,-1.6867 -0.4473,-3.7708 -0.496,-4.4601 -0.2495,-3.4513 -0.1629,-6.8503 0.2465,-10.1894 0.4156,-3.3687 1.161,-6.6746 2.2264,-9.9082 0.6131,-1.8666 1.3318,-3.6671 2.1195,-5.37 0.8392,-1.8151 1.7615,-3.5297 2.7259,-5.1097 0.8601,-1.4104 1.5765,-2.4729 2.3205,-3.4865 0.7504,-1.0195 1.53,-1.9898 2.5128,-3.2068 0.1338,-0.1638 0.289,-0.3303 0.4425,-0.495l-0.0022 -0.001c0.1612,-0.1732 0.3228,-0.3454 0.4738,-0.5278l0.0049 -0.0045 0.1065 -0.1299 0.0035 -0.0034c0.1241,-0.1535 0.1312,-0.1602 0.5535,-0.3193 6.0437,-2.2776 13.1502,-3.0769 20.403,-3.1354 7.3004,-0.0586 14.7769,0.636 21.4748,1.331 0.9572,0.0992 2.0924,0.2255 3.2396,0.3539l0 0zm29.2613 23.6779c-1.8447,-0.3094 -3.7299,-0.3651 -5.8191,-0.376l-0.1989 -0.8495c-0.6272,-2.6843 -1.2207,-5.2236 -2.1054,-7.9643 -0.1288,-0.398 -0.2529,-0.744 -0.3768,-1.0954 -0.0818,-0.2289 -0.164,-0.46 -0.2413,-0.6844 2.6941,-0.35 5.9711,-0.4857 9.2178,-0.35 3.3331,0.1404 6.6265,0.5666 9.2001,1.3427 0.0763,0.0233 -0.0656,0.0035 -0.0233,0.1005 0.0373,0.0854 0.0832,0.1884 0.1629,0.3602l-0.0013 0 1.6211 3.7789c1.0989,2.8953 1.9392,5.8615 2.5068,8.8961 0.5712,3.0501 0.8685,6.1665 0.8788,9.3522 0,0.1316 -0.0011,0.3022 -0.0025,0.5058 -0.5228,-1.3437 -1.141,-2.619 -1.8464,-3.8083 -1.6912,-2.8476 -3.8962,-5.207 -6.5353,-6.8047 -2.2214,-1.3462 -4.2933,-2.0436 -6.4372,-2.4038z"/>
    </g>
    
    <!-- Text - positioned with fixed baseline at y=230 -->
    <text x="${totalWidth/2}" y="230" font-family="Arial Black, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="${color}" text-anchor="middle" dominant-baseline="baseline">${text}</text>
    
    <!-- Hanger SVG (bottom) - positioned so figures overlap it -->
    <g transform="translate(0, 210)">
        <path fill="${color}" d="M90 39c-1.3807,0 -2.5,1.1193 -2.5,2.5 0,1.3807 1.1193,2.5 2.5,2.5 1.3807,0 2.5,-1.1193 2.5,-2.5 0,-1.3807 -1.1193,-2.5 -2.5,-2.5zm180 0c-1.3807,0 -2.5,1.1193 -2.5,2.5 0,1.3807 1.1193,2.5 2.5,2.5 1.3807,0 2.5,-1.1193 2.5,-2.5 0,-1.3807 -1.1193,-2.5 -2.5,-2.5zm180 0c-1.3807,0 -2.5,1.1193 -2.5,2.5 0,3.2884 5,3.2884 5,0 0,-1.3807 -1.1193,-2.5 -2.5,-2.5zm-415 -13.3275c-8.2843,0 -15,3.3756 -15,11.655l0 27 0 17 0 19c0,8.2804 6.7157,14 15,14l104.592 0c1.0999,0 2.5748,-4.4911 3.1869,-10.2313 0.2537,-2.38 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l95.5917 0c1.0999,0 2.5748,-4.4911 3.1869,-10.2313 0.2537,-2.38 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l95.5917 0c1.0999,0 2.5748,-4.4911 3.1869,-10.2313 0.2537,-2.38 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l212 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.232 -3.277,3.612 0.6121,5.7402 2.087,10.2313 3.1869,10.2313l95.5917 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.232 -3.277,3.612 0.6121,5.7402 2.087,10.2313 3.1869,10.2313l95.5917 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.232 -3.277,3.612 0.6121,5.7402 2.087,10.2313 3.1869,10.2313l219.183 0c1.0999,0 2.575,-4.4911 3.1869,-10.2313 0.2537,-2.3798 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l95.5917 0c1.0999,0 2.575,-4.4911 3.1869,-10.2313 0.2537,-2.3798 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l95.5917 0c1.0999,0 2.575,-4.4911 3.1869,-10.2313 0.2537,-2.3798 -0.4185,-3.7907 -3.277,-3.612 -2.2588,-0.1708 -6.4631,1.8141 -6.9631,1.8323l-88.5385 1.0045c-1.6533,-0.0065 -3.9935,-2.3467 -3.9935,-4 0,-1.6533 2.3402,-3.9935 3.9935,-3.9935l212 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.2322 -3.277,3.612 0.6119,5.7402 2.087,10.2313 3.1869,10.2313l95.5917 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.2322 -3.277,3.612 0.6119,5.7402 2.087,10.2313 3.1869,10.2313l95.5917 0c1.6533,0 3.9935,2.3402 3.9935,3.9935 0,1.6533 -2.3402,3.9935 -3.9935,4l-88.5385 -1.0045c-0.5,-0.0182 -4.7043,-2.0031 -6.9631,-1.8323 -2.8585,-0.1787 -3.5307,1.2322 -3.277,3.612 0.6119,5.7402 2.087,10.2313 3.1869,10.2313l104.592 0c8.2843,0 15,-5.7188 15,-14l0 -19 0 -10.2998 0 -33.7002c0,-7.8391 -6.0188,-11.2805 -13.6891,-11.6254l-471.311 -0.0296z"/>
    </g>
</svg>`;
}

// Update figure in preview
function updateFigure(side, figureKey) {
    const figureElement = document.getElementById(side + '-figure');
    
    if (figureKey === 'none') {
        figureElement.innerHTML = '';
        return;
    }
    
    const figure = figureDefinitions[figureKey];
    if (!figure) return;
    
    // Get current color
    const currentColor = document.querySelector('.color-option.active')?.getAttribute('data-color') || '#C0C0C0';
    
    figureElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="120" height="120" 
             style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" 
             viewBox="${figure.viewBox}">
            <path class="svg-element" fill="${currentColor}" d="${figure.path}"/>
        </svg>
    `;
}

// Load figure options from static definitions and update scroll menus
function loadFigureOptions() {
    try {
        // Use static figure options from figureDefinitions.js
        const figureOptions = window.figureOptions || [];
        updateScrollMenus(figureOptions);
    } catch (error) {
        console.error('Error loading figure options:', error);
    }
}

// Update scroll menus with available figures
function updateScrollMenus(figureOptions) {
    const leftMenu = document.getElementById('left-figure-menu');
    const rightMenu = document.getElementById('right-figure-menu');
    
    if (!leftMenu || !rightMenu) return;
    
    // Clear existing dynamic options (keep "none" option)
    const dynamicOptions = document.querySelectorAll('.figure-option:not([data-figure="none"])');
    dynamicOptions.forEach(option => option.remove());
    
    // Add all figures from figureOptions (including defaults if they exist)
    figureOptions.forEach(figure => {
        // Create left menu option
        const leftOption = createFigureOption(figure);
        leftMenu.appendChild(leftOption);
        
        // Create right menu option
        const rightOption = createFigureOption(figure);
        rightMenu.appendChild(rightOption);
    });
    
    // Auto-select first two figures if available
    if (figureOptions.length >= 1) {
        // Set first figure as left figure
        const firstFigureOption = leftMenu.querySelector(`[data-figure="${figureOptions[0].id}"]`);
        if (firstFigureOption) {
            firstFigureOption.classList.add('active');
            updateFigure('left', figureOptions[0].id);
        }
    }
    
    if (figureOptions.length >= 2) {
        // Set second figure as right figure
        const secondFigureOption = rightMenu.querySelector(`[data-figure="${figureOptions[1].id}"]`);
        if (secondFigureOption) {
            secondFigureOption.classList.add('active');
            updateFigure('right', figureOptions[1].id);
        }
    }
    
    // Re-attach event listeners
    attachFigureEventListeners();
}

// Create figure option element
function createFigureOption(figure) {
    const option = document.createElement('div');
    option.className = 'figure-option';
    option.setAttribute('data-figure', figure.id);
    option.setAttribute('title', figure.name);
    
    // Create thumbnail
    let thumbnailContent = '';
    if (figure.thumbnailContent) {
        thumbnailContent = figure.thumbnailContent;
    } else {
        // Fallback to filename-based thumbnail
        thumbnailContent = `<img src="${figure.filename.replace('.svg', '-thumb.svg')}" alt="${figure.name}" style="max-width: 40px; max-height: 40px;">`;
    }
    
    option.innerHTML = thumbnailContent;
    return option;
}

// Attach event listeners to figure options
function attachFigureEventListeners() {
    // Left figure menu
    document.querySelectorAll('#left-figure-menu .figure-option').forEach(option => {
        option.removeEventListener('click', leftClickHandler); // Remove existing listeners
        option.addEventListener('click', leftClickHandler);
    });
    
    // Right figure menu
    document.querySelectorAll('#right-figure-menu .figure-option').forEach(option => {
        option.removeEventListener('click', rightClickHandler); // Remove existing listeners
        option.addEventListener('click', rightClickHandler);
    });
}

// Event handlers
function leftClickHandler() {
    // Remove active class from all left options
    document.querySelectorAll('#left-figure-menu .figure-option').forEach(opt => opt.classList.remove('active'));
    
    // Add active class to clicked option
    this.classList.add('active');
    
    // Update left figure
    const selectedFigure = this.getAttribute('data-figure');
    updateFigure('left', selectedFigure);
}

function rightClickHandler() {
    // Remove active class from all right options
    document.querySelectorAll('#right-figure-menu .figure-option').forEach(opt => opt.classList.remove('active'));
    
    // Add active class to clicked option
    this.classList.add('active');
    
    // Update right figure
    const selectedFigure = this.getAttribute('data-figure');
    updateFigure('right', selectedFigure);
}

// Figure selection functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initializeColors();
    
    // Load additional figures from admin
    loadFigureOptions();
    
    // Attach initial event listeners
    attachFigureEventListeners();
    
    // Note: No longer listening for storage changes since we use static JS files
});