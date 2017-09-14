(function (App) {
    'use strict';
    var OS = require('opensubtitles-api'),
        openSRT;

    var OpenSubtitles = function () {
        openSRT = new OS({
            
            useragent: 'Popcorn Time NodeJS',
            username: Settings.opensubtitlesUsername,
            password: Settings.opensubtitlesPassword,
            ssl: true
        });
    };

    OpenSubtitles.prototype.constructor = OpenSubtitles;
    OpenSubtitles.prototype.config = {
        name: 'OpenSubtitles'
    };

    var normalizeLangCodes = function (data) {
        if ('pb' in data) {
            data['pt-br'] = data['pb'];
            delete data['pb'];
        }
        return data;
    };

    var formatForButter = function (data_obj) {
        var data = {};
        var multi_id = 0;

        // formating returned subtitle object into array
        for (const[langcode,value] of Object.entries(data_obj)) {
            multi_id=1;
            value.forEach(function(subtitle) {
                if (multi_id === 1) {
                    data[ langcode ] = subtitle;
                } else {
                    data[ langcode + '|' + multi_id.toString() ] = subtitle;
                }
                multi_id++;
            });
        }

        data = normalizeLangCodes(data);
        for (var lang in data) {
            data[lang] = data[lang].url;
        }
        return Common.sanitize(data);
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        queryParams.extensions = ['srt'];
        // this will return all available subtitles, not just 1 per language
        queryParams.limit='all';
        return openSRT.search(queryParams)
            .then(formatForButter);
    };

    OpenSubtitles.prototype.upload = function (queryParams) {
        return openSRT.upload(queryParams);
    };

    App.Providers.install(OpenSubtitles);

})(window.App);
