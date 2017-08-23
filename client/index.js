
$(document).ready(function() {
    //Set up positions on click
    $(document).on("click", ".userContent", function () {
        //Reset after another click
        $(".userContent").removeClass('hover-box');
        $("#result-box").remove();

        $(this).addClass('hover-box');
        $("body").append("<div id='result-box'></div>");

        //Placeholder so that result comes in the order of translation, sentiment and lastly emotion
        $("#result-box").append("<div id='translation-box'>" +
            "<p id='label1'>Translation</p>" +
            "<p id='translations'></p></div>" +
            "<div id='sentiment-box'></div>" +
            "<div id='emotion-box'></div>");

        //Add css to result box relatively
        var position = $(this).offset();
        var width = $(this).width();
        var height = $(this).height();

        $("#result-box").css("left", (position.left + width)  + "px")
            .css("top", position.top -height + "px")
            .css("width", width/2 + "px");

        //Append content into result-box
            //Append translation
        var translation;
        var content = $(this).find($("p")).text();
        var url1 = "https://www.googleapis.com/language/translate/v2?key=AIzaSyD4rLhLb3ZmwjLJDt-njNqFYP30eHeaBTQ&target=en&q=";
        $.get(url1 + content, function (data) {
            translation = data.data.translations[0].translatedText;
            $("#translations").html(translation);

            //Pass in translation and append emotion graph
                //See server
            var url2 = "https://secret-thicket-72090.herokuapp.com/api/emotion";
            $.post(url2, {text: translation}, function (data) {
                //Set up layout
                $("<p id='label3'>Emotion</p>").insertBefore("#emotion-box");

                var emotionData = [data.docEmotions.anger, data.docEmotions.sadness, data.docEmotions.joy, data.docEmotions.fear, data.docEmotions.disgust];
                var imgSrc = [chrome.extension.getURL("./assets/images/Anger.png"), chrome.extension.getURL("./assets/images/Sadness.png"), chrome.extension.getURL("./assets/images/Joy.png"), chrome.extension.getURL("./assets/images/Fear.png"), chrome.extension.getURL("./assets/images/Disgust.png")];

                //Compose new data array
                var newComposedDataArray = [];

                for (i = 0; i < emotionData.length; i++) {
                    newComposedDataArray.push({"score": emotionData[i],
                                    "imgSrc":imgSrc[i]
                    });
                }

                plotHistogram(newComposedDataArray, width/2, 150);


                var emojiBox = document.createElement("div");
                emojiBox.setAttribute("id", "emoji-box");

                for (i in imgSrc) {
                    var img = document.createElement("img");
                    img.setAttribute("class", "emojis");
                    img.src = imgSrc[i];
                    emojiBox.appendChild(img);
                }

                var resultBox = document.getElementById("result-box");
                resultBox.appendChild(emojiBox);
            });

            // Pass in translation and append sentiment graph
                //See server
            var url3 = "https://secret-thicket-72090.herokuapp.com/api/sentiment";
            $.post(url3, {text: translation}, function(data){
                //Set up layout
                $("<p id='label2'>Feeling</p>").insertBefore("#sentiment-box");
                $("<p id='scale'><span id='negative'>Negative</span> <span id='positive'>Positive</span></p>").insertAfter("#sentiment-box");
                $("#sentiment-box").append("<canvas id='sentimentGraph'></canvas>");
                $("#sentimentGraph").css("width", width/2 + "px");

                //Initial data variables
                var sentimentData = data.docSentiment;
                var chartData = [sentimentData.score];
                var typeData = [sentimentData.type];

                //Circumvent where neutral returns no score
                var score = function() {
                    if (typeData != "neutral" && chartData != null) {
                        return chartData;
                    } else {
                        return ["0"];
                    }
                };

                //Styling factors; see http://bernii.github.io/gauge.js/
                var opts = {
                    lines: 12,
                    angle: 0.15,
                    lineWidth: 0.44,
                    radiusScale: 0.80,
                    pointer: {
                        length: 0.7,
                        strokeWidth: 0.03,
                        color: '#000000'
                    },
                    limitMax: 'false',
                    percentColors: [[0.0, "#A52A2A" ], [1.0, "#4682b4"]],
                    strokeColor: '#E0E0E0',
                    colorStart: '#A52A2A',
                    colorStop: '#4682b4',
                    generateGradient: true
                };

                //Fire
                var target = document.getElementById('sentimentGraph');
                var gauge = new Gauge(target).setOptions(opts);
                gauge.minValue = -1;
                gauge.maxValue = 1;
                gauge.animationSpeed = 32;
                gauge.set(score(sentimentData));
            });
        });
    });
});


function plotHistogram(data, width, height) {

    var colors = ['#E40B15', '#f4b042', '#ECEB3B', '#0B76E4', '#1DD649'];

// set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    var emotionSvg = d3.select('#emotion-box').append('svg')
        .attr("width", width)
        .attr("height", height);

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.imgSrc; }));
    y.domain([0, d3.max(data, function(d) { return d.score; })]);

    emotionSvg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.imgSrc); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.score); })
        .attr("height", function(d) { return height - y(d.score); })
        .attr("fill",function(d,i){
            return colors[i]});
};