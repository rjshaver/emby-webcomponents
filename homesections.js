﻿define(['cardBuilder', 'appSettings', 'dom', 'apphost', 'layoutManager', 'imageLoader', 'globalize', 'scrollStyles', 'emby-button', 'paper-icon-button-light', 'emby-itemscontainer'], function (cardBuilder, appSettings, dom, appHost, layoutManager, imageLoader, globalize) {
    'use strict';

    function getDefaultSection(index) {

        switch (index) {

            case 0:
                return 'smalllibrarytiles';
            case 1:
                return 'activerecordings';
            case 2:
                return 'resume';
            case 3:
                return 'resumeaudio';
            case 4:
                return 'nextup';
            case 5:
                return 'latestmedia';
            case 6:
                return 'latesttvrecordings';
            default:
                return '';
        }
    }

    function loadSection(page, apiClient, user, userSettings, index) {

        var userId = user.Id;

        var section = userSettings.get('homesection' + index) || getDefaultSection(index);

        if (section === 'folders') {
            section = getDefaultSection()[0];
        }

        var elem = page.querySelector('.section' + index);

        if (section === 'latestmedia') {
            return loadRecentlyAdded(elem, apiClient, user);
        }
        else if (section === 'librarytiles') {
            return loadLibraryTiles(elem, apiClient, user, 'backdrop', index);
        }
        else if (section === 'smalllibrarytiles') {
            return loadLibraryTiles(elem, apiClient, user, 'smallBackdrop', index);
        }
        else if (section === 'smalllibrarytiles-automobile') {
            return loadLibraryTiles(elem, apiClient, user, 'smallBackdrop', index);
        }
        else if (section === 'librarytiles-automobile') {
            return loadLibraryTiles(elem, apiClient, user, 'backdrop', index);
        }
        else if (section === 'librarybuttons') {
            return loadlibraryButtons(elem, apiClient, userId, index);
        }
        else if (section === 'resume') {
            return loadResumeVideo(elem, apiClient, userId);
        }
        else if (section === 'resumeaudio') {
            return loadResumeAudio(elem, apiClient, userId);
        }
        else if (section === 'activerecordings') {
            return loadActiveRecordings(elem, apiClient, userId);
        }
        else if (section === 'nextup') {
            return loadNextUp(elem, apiClient, userId);
        }
        else if (section === 'latesttvrecordings') {
            return loadLatestLiveTvRecordings(elem, apiClient, userId);
        }
        else if (section === 'latestchannelmedia') {
            return loadLatestChannelMedia(elem, apiClient, userId);

        } else {

            elem.innerHTML = '';

            return Promise.resolve();
        }
    }

    function getUserViews(apiClient, userId) {

        return apiClient.getUserViews({}, userId || apiClient.getCurrentUserId()).then(function (result) {

            return result.Items;
        });
    }

    function enableScrollX() {
        return !layoutManager.desktop;
    }

    function getSquareShape() {
        return enableScrollX() ? 'overflowSquare' : 'square';
    }

    function getThumbShape() {
        return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
    }

    function getPortraitShape() {
        return enableScrollX() ? 'overflowPortrait' : 'portrait';
    }

    function getLibraryButtonsHtml(items) {

        var html = "";

        html += '<div>';

        html += '<div>';
        html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderMyMedia') + '</h2>';
        html += '</div>';

        html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap" data-multiselect="false">';

        // "My Library" backgrounds
        for (var i = 0, length = items.length; i < length; i++) {

            var item = items[i];

            var icon;

            switch (item.CollectionType) {
                case "movies":
                    icon = "local_movies";
                    break;
                case "music":
                    icon = "library_music";
                    break;
                case "photos":
                    icon = "photo";
                    break;
                case "livetv":
                    icon = "live_tv";
                    break;
                case "tvshows":
                    icon = "live_tv";
                    break;
                case "games":
                    icon = "folder";
                    break;
                case "trailers":
                    icon = "local_movies";
                    break;
                case "homevideos":
                    icon = "video_library";
                    break;
                case "musicvideos":
                    icon = "video_library";
                    break;
                case "books":
                    icon = "folder";
                    break;
                case "channels":
                    icon = "folder";
                    break;
                case "playlists":
                    icon = "folder";
                    break;
                default:
                    icon = "folder";
                    break;
            }

            var cssClass = 'card smallBackdropCard buttonCard';

            if (item.CollectionType) {
                cssClass += ' ' + item.CollectionType + 'buttonCard';
            }

            var href = item.url || libraryBrowser.getHref(item);
            var onclick = item.onclick ? ' onclick="' + item.onclick + '"' : '';

            icon = item.icon || icon;

            html += '<a' + onclick + ' data-id="' + item.Id + '" class="' + cssClass + '" href="' + href + '" style="min-width:12.5%;">';
            html += '<div class="cardBox ' + cardBuilder.getDefaultColorClass(item.Name) + '" style="margin:4px;">';

            html += "<div class='cardText'>";
            html += '<i class="md-icon">' + icon + '</i>';
            html += '<span style="margin-left:.7em;">' + item.Name + '</span>';
            html += "</div>";

            html += "</div>";

            html += "</a>";
        }

        html += '</div>';
        html += '</div>';
        return html;
    }

    function loadlibraryButtons(elem, apiClient, userId, index) {

        return getUserViews(apiClient, userId).then(function (items) {

            var html = getLibraryButtonsHtml(items);

            return getAppInfo().then(function (infoHtml) {

                elem.innerHTML = html + infoHtml;
            });
        });
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getAppInfo() {

        return Promise.resolve('');
        //var frequency = 86400000;

        //if (AppInfo.isNativeApp) {
        //    frequency = 172800000;
        //}

        //var cacheKey = 'lastappinfopresent5';
        //var lastDatePresented = parseInt(appSettings.get(cacheKey) || '0');

        //// Don't show the first time, right after installation
        //if (!lastDatePresented) {
        //    appSettings.set(cacheKey, new Date().getTime());
        //    return Promise.resolve('');
        //}

        //if ((new Date().getTime() - lastDatePresented) < frequency) {
        //    return Promise.resolve('');
        //}

        //return Dashboard.getPluginSecurityInfo().then(function (pluginSecurityInfo) {

        //    appSettings.set(cacheKey, new Date().getTime());

        //    if (pluginSecurityInfo.IsMBSupporter) {
        //        return '';
        //    }

        //    var infos = [getPremiereInfo];

        //    if (!browserInfo.safari || !AppInfo.isNativeApp) {
        //        infos.push(getTheaterInfo);
        //    }

        //    return infos[getRandomInt(0, infos.length - 1)]();
        //});
    }

    function getCard(img, target, shape) {

        shape = shape || 'backdropCard';
        var html = '<div class="card scalableCard ' + shape + ' ' + shape + '-scalable"><div class="cardBox"><div class="cardScalable"><div class="cardPadder cardPadder-backdrop"></div>';

        if (target) {
            html += '<a class="cardContent" href="' + target + '" target="_blank">';
        } else {
            html += '<div class="cardContent">';
        }

        html += '<div class="cardImage lazy" data-src="' + img + '"></div>';

        if (target) {
            html += '</a>';
        } else {
            html += '</div>';
        }

        html += '</div></div></div>';

        return html;
    }

    function getTheaterInfo() {

        var html = '';
        html += '<div>';
        html += '<h1>Discover Emby Theater<button is="paper-icon-button-light" style="margin-left:1em;" onclick="this.parentNode.parentNode.remove();" class="autoSize"><i class="md-icon">close</i></button></h1>';

        var nameText = AppInfo.isNativeApp ? 'Emby Theater' : '<a href="https://emby.media/download" target="_blank">Emby Theater</a>';
        html += '<p>A beautiful app for your TV and large screen tablet. ' + nameText + ' runs on Windows, Xbox One, Raspberry Pi, Samsung Smart TVs, Sony PS4, Web Browsers, and more.</p>';
        html += '<div class="itemsContainer vertical-wrap">';
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater1.png', 'https://emby.media/download');
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater2.png', 'https://emby.media/download');
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater3.png', 'https://emby.media/download');
        html += '</div>';
        html += '<br/>';
        html += '</div>';
        return html;
    }

    function getPremiereInfo() {

        var html = '';
        html += '<div>';
        html += '<h1>Discover Emby Premiere<button is="paper-icon-button-light" style="margin-left:1em;" onclick="this.parentNode.parentNode.remove();" class="autoSize"><i class="md-icon">close</i></button></h1>';

        var cardTarget = AppInfo.isNativeApp ? '' : 'https://emby.media/premiere';
        var learnMoreText = AppInfo.isNativeApp ? '' : '<a href="https://emby.media/premiere" target="_blank">Learn more</a>';

        html += '<p>Design beautiful Cover Art, enjoy free access to Emby apps, and more. ' + learnMoreText + '</p>';
        html += '<div class="itemsContainer vertical-wrap">';
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater1.png', cardTarget);
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater2.png', cardTarget);
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater3.png', cardTarget);
        html += '</div>';
        html += '<br/>';
        html += '</div>';
        return html;
    }

    function getUpgradeMobileLayoutsInfo() {
        var html = '';
        html += '<div>';
        html += '<h1>Unlock Improved Layouts with Emby Premiere<button is="paper-icon-button-light" style="margin-left:1em;" onclick="this.parentNode.parentNode.remove();" class="autoSize"><i class="md-icon">close</i></button></h1>';

        var cardTarget = AppInfo.isNativeApp ? '' : 'https://emby.media/premiere';
        var learnMoreText = AppInfo.isNativeApp ? '' : '<a href="https://emby.media/premiere" target="_blank">Learn more</a>';

        html += '<p>Combined horizontal and vertical swiping, better detail layouts, and more. ' + learnMoreText + '</p>';
        html += '<div class="itemsContainer vertical-wrap">';
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/ms1.png', cardTarget, 'portraitCard');
        html += getCard('https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/ms2.png', cardTarget, 'portraitCard');
        html += '</div>';
        html += '<br/>';
        html += '</div>';
        return html;
    }

    function renderLatestSection(elem, apiClient, user, parent) {

        var options = {

            Limit: 12,
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            ParentId: parent.Id
        };

        return apiClient.getJSON(apiClient.getUrl('Users/' + user.Id + '/Items/Latest', options)).then(function (items) {

            var html = '';

            if (items.length) {

                html += '<div class="sectionTitleContainer">';
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('LatestFromLibrary', parent.Name) + '</h2>';
                if (!layoutManager.tv) {
                    html += '<a href="' + libraryBrowser.getHref(parent) + '" class="clearLink" style="margin-left:2em;"><button is="emby-button" type="button" class="raised more mini"><span>' + Globalize.translate('ButtonMore') + '</span></button></a>';
                }
                html += '</div>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                var viewType = parent.CollectionType;

                var shape = viewType === 'movies' ?
                    getPortraitShape() :
                    viewType === 'music' ?
                    getSquareShape() :
                    getThumbShape();

                var supportsImageAnalysis = appHost.supports('imageanalysis');
                supportsImageAnalysis = false;
                var cardLayout = supportsImageAnalysis && (viewType === 'music' || viewType === 'movies' || viewType === 'tvshows' || viewType === 'musicvideos' || !viewType);

                html += cardBuilder.getCardsHtml({
                    items: items,
                    shape: shape,
                    preferThumb: viewType !== 'movies' && viewType !== 'music',
                    showUnplayedIndicator: false,
                    showChildCountIndicator: true,
                    context: 'home',
                    overlayText: false,
                    centerText: !cardLayout,
                    overlayPlayButton: viewType !== 'photos',
                    allowBottomPadding: !enableScrollX() && !cardLayout,
                    cardLayout: cardLayout,
                    showTitle: viewType === 'music' || viewType === 'tvshows' || viewType === 'movies' || !viewType || cardLayout,
                    showYear: viewType === 'movies' || !viewType,
                    showParentTitle: viewType === 'music' || viewType === 'tvshows' || !viewType || (cardLayout && (viewType === 'tvshows')),
                    vibrant: supportsImageAnalysis && cardLayout,
                    lines: 2
                });

                if (enableScrollX()) {
                    html += '</div>';
                }
                html += '</div>';
            }

            elem.innerHTML = html;
            imageLoader.lazyChildren(elem);
        });
    }

    function loadRecentlyAdded(elem, apiClient, user) {

        elem.classList.remove('verticalSection');

        return getUserViews(apiClient, user.Id).then(function (items) {

            var excludeViewTypes = ['playlists', 'livetv', 'boxsets', 'channels'];
            var excludeItemTypes = ['Channel'];

            for (var i = 0, length = items.length; i < length; i++) {

                var item = items[i];

                if (user.Configuration.LatestItemsExcludes.indexOf(item.Id) !== -1) {
                    continue;
                }

                if (excludeViewTypes.indexOf(item.CollectionType || []) !== -1) {
                    continue;
                }

                // not implemented yet
                if (excludeItemTypes.indexOf(item.Type) !== -1) {
                    continue;
                }

                var frag = document.createElement('div');
                frag.classList.add('verticalSection');
                elem.appendChild(frag);

                renderLatestSection(frag, apiClient, user, item);
            }
        });
    }

    function loadLatestChannelMedia(elem, apiClient, userId) {

        var screenWidth = dom.getWindowSize().innerWidth;

        var options = {

            Limit: screenWidth >= 2400 ? 10 : (screenWidth >= 1600 ? 10 : (screenWidth >= 1440 ? 8 : (screenWidth >= 800 ? 7 : 6))),
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            Filters: "IsUnplayed",
            UserId: userId
        };

        return apiClient.getJSON(apiClient.getUrl("Channels/Items/Latest", options)).then(function (result) {

            var html = '';

            if (result.Items.length) {
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderLatestChannelMedia') + '</h2>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: 'auto',
                    showTitle: true,
                    centerText: true,
                    lazy: true,
                    showDetailsMenu: true,
                    overlayPlayButton: true
                });

                if (enableScrollX()) {
                    html += '</div>';
                }
            }

            elem.innerHTML = html;
            imageLoader.lazyChildren(elem);
        });
    }

    function loadLibraryTiles(elem, apiClient, user, shape) {

        return getUserViews(apiClient, user.Id).then(function (items) {

            var html = '';

            html += '<div>';

            if (items.length) {

                html += '<div>';
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderMyMedia') + '</h2>';
                html += '</div>';

                var scrollX = enableScrollX();

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                html += cardBuilder.getCardsHtml({
                    items: items,
                    shape: scrollX ? 'overflowSmallBackdrop' : shape,
                    showTitle: true,
                    centerText: true,
                    overlayText: false,
                    lazy: true,
                    transition: false,
                    allowBottomPadding: !scrollX
                });

                if (enableScrollX()) {
                    html += '</div>';
                }
                html += '</div>';
            }

            html += '</div>';

            return getAppInfo().then(function (infoHtml) {

                elem.innerHTML = html + infoHtml;
                imageLoader.lazyChildren(elem);
            });
        });
    }

    function loadResumeVideo(elem, apiClient, userId) {

        var screenWidth = dom.getWindowSize().innerWidth;

        var limit;

        if (enableScrollX()) {

            limit = 12;

        } else {

            limit = screenWidth >= 1920 ? 8 : (screenWidth >= 1600 ? 8 : (screenWidth >= 1200 ? 9 : 6));
            limit = Math.min(limit, 5);
        }

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            Filters: "IsResumable",
            Limit: limit,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            CollapseBoxSetItems: false,
            ExcludeLocationTypes: "Virtual",
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            EnableTotalRecordCount: false,
            MediaTypes: 'Video'
        };

        return apiClient.getItems(userId, options).then(function (result) {

            var html = '';

            if (result.Items.length) {
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderContinueWatching') + '</h2>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                var supportsImageAnalysis = appHost.supports('imageanalysis');
                supportsImageAnalysis = false;
                var cardLayout = supportsImageAnalysis;

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    preferThumb: true,
                    shape: getThumbShape(),
                    overlayText: false,
                    showTitle: true,
                    showParentTitle: true,
                    lazy: true,
                    showDetailsMenu: true,
                    overlayPlayButton: true,
                    context: 'home',
                    centerText: !cardLayout,
                    allowBottomPadding: false,
                    cardLayout: cardLayout,
                    showYear: true,
                    lines: 2,
                    vibrant: cardLayout && supportsImageAnalysis
                });

                if (enableScrollX()) {
                    html += '</div>';
                }
                html += '</div>';
            }

            elem.innerHTML = html;

            imageLoader.lazyChildren(elem);
        });
    }

    function loadResumeAudio(elem, apiClient, userId) {

        var screenWidth = dom.getWindowSize().innerWidth;

        var limit;

        if (enableScrollX()) {

            limit = 12;

        } else {

            limit = screenWidth >= 1920 ? 8 : (screenWidth >= 1600 ? 8 : (screenWidth >= 1200 ? 9 : 6));
            limit = Math.min(limit, 5);
        }

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            Filters: "IsResumable",
            Limit: limit,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            CollapseBoxSetItems: false,
            ExcludeLocationTypes: "Virtual",
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            EnableTotalRecordCount: false,
            MediaTypes: 'Audio'
        };

        return apiClient.getItems(userId, options).then(function (result) {

            var html = '';

            if (result.Items.length) {
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderContinueListening') + '</h2>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                var cardLayout = false;

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    preferThumb: true,
                    shape: getThumbShape(),
                    overlayText: false,
                    showTitle: true,
                    showParentTitle: true,
                    lazy: true,
                    showDetailsMenu: true,
                    overlayPlayButton: true,
                    context: 'home',
                    centerText: !cardLayout,
                    allowBottomPadding: false,
                    cardLayout: cardLayout,
                    showYear: true,
                    lines: 2
                });

                if (enableScrollX()) {
                    html += '</div>';
                }

                html += '</div>';
            }

            elem.innerHTML = html;

            imageLoader.lazyChildren(elem);
        });
    }

    function loadActiveRecordings(elem, apiClient, userId) {

        apiClient.getLiveTvRecordings({

            UserId: userId,
            IsInProgress: true,
            Fields: 'CanDelete,PrimaryImageAspectRatio,BasicSyncInfo',
            EnableTotalRecordCount: false,
            EnableImageTypes: "Primary,Thumb,Backdrop"

        }).then(function (result) {

            var html = '';

            if (result.Items.length) {

                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderActiveRecordings') + '</h2>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                var supportsImageAnalysis = appHost.supports('imageanalysis');
                supportsImageAnalysis = false;
                var cardLayout = false;

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    lazy: true,
                    allowBottomPadding: !enableScrollX(),
                    shape: getThumbShape(),
                    showTitle: false,
                    showParentTitleOrTitle: true,
                    showAirTime: true,
                    showAirEndTime: true,
                    showChannelName: true,
                    cardLayout: cardLayout,
                    preferThumb: true,
                    coverImage: true,
                    overlayText: false,
                    centerText: !cardLayout,
                    overlayMoreButton: true
                    //action: 'play'

                });

                if (enableScrollX()) {
                    html += '</div>';
                }

                html += '</div>';
            }

            elem.innerHTML = html;

            imageLoader.lazyChildren(elem);
        });
    }

    function loadNextUp(elem, apiClient, userId) {

        var query = {

            Limit: enableScrollX() ? 24 : 15,
            Fields: "PrimaryImageAspectRatio,SeriesInfo,DateCreated,BasicSyncInfo",
            UserId: userId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Banner,Thumb",
            EnableTotalRecordCount: false
        };

        apiClient.getNextUpEpisodes(query).then(function (result) {

            var html = '';

            if (result.Items.length) {

                html += '<div class="sectionTitleContainer">';
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderNextUp') + '</h2>';
                if (!layoutManager.tv) {
                    html += '<a href="secondaryitems.html?type=nextup" class="clearLink" style="margin-left:2em;"><button is="emby-button" type="button" class="raised more mini"><span>' + globalize.translate('ButtonMore') + '</span></button></a>';
                }
                html += '</div>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                var supportsImageAnalysis = appHost.supports('imageanalysis');
                supportsImageAnalysis = false;

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    preferThumb: true,
                    shape: getThumbShape(),
                    overlayText: false,
                    showTitle: true,
                    showParentTitle: true,
                    lazy: true,
                    overlayPlayButton: true,
                    context: 'home',
                    centerText: !supportsImageAnalysis,
                    allowBottomPadding: !enableScrollX(),
                    cardLayout: supportsImageAnalysis,
                    vibrant: supportsImageAnalysis
                });

                if (enableScrollX()) {
                    html += '</div>';
                }

                html += '</div>';
            }

            elem.innerHTML = html;

            imageLoader.lazyChildren(elem);
        });
    }

    function loadLatestChannelItems(elem, apiClient, userId, options) {

        options = Object.assign(options || {}, {

            UserId: userId,
            SupportsLatestItems: true
        });

        return apiClient.getJSON(apiClient.getUrl("Channels", options)).then(function (result) {

            var channels = result.Items;

            var channelsHtml = channels.map(function (c) {

                return '<div id="channel' + c.Id + '"></div>';

            }).join('');

            elem.innerHTML = channelsHtml;

            for (var i = 0, length = channels.length; i < length; i++) {

                var channel = channels[i];

                loadLatestChannelItemsFromChannel(elem, channel, i);
            }

        });
    }

    function loadLatestChannelItemsFromChannel(page, apiClient, channel, index) {

        var screenWidth = dom.getWindowSize().innerWidth;

        var options = {

            Limit: screenWidth >= 1600 ? 10 : (screenWidth >= 1440 ? 5 : (screenWidth >= 800 ? 6 : 6)),
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            Filters: "IsUnplayed",
            UserId: apiClient.getCurrentUserId(),
            ChannelIds: channel.Id
        };

        apiClient.getJSON(apiClient.getUrl("Channels/Items/Latest", options)).then(function (result) {

            var html = '';

            if (result.Items.length) {

                html += '<div class="verticalSection">';

                html += '<div class="sectionTitleContainer">';
                var text = globalize.translate('HeaderLatestFromChannel').replace('{0}', channel.Name);
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + text + '</h2>';
                if (!layoutManager.tv) {
                    html += '<a href="channelitems.html?id=' + channel.Id + '" class="clearLink" style="margin-left:2em;"><button is="emby-button" type="button" class="raised more mini"><span>' + globalize.translate('ButtonMore') + '</span></button></a>';
                }
                html += '</div>';

                if (enableScrollX()) {
                    html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
                } else {
                    html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
                }

                html += cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: enableScrollX() ? 'autooverflow' : 'auto',
                    defaultShape: 'square',
                    showTitle: true,
                    centerText: true,
                    lazy: true,
                    showDetailsMenu: true,
                    overlayPlayButton: true,
                    allowBottomPadding: !enableScrollX()
                });

                if (enableScrollX()) {
                    html += '</div>';
                }
                html += '</div>';
                html += '</div>';
            }

            var elem = page.querySelector('#channel' + channel.Id + '');
            elem.innerHTML = html;
            imageLoader.lazyChildren(elem);
        });
    }

    function loadLatestLiveTvRecordings(elem, apiClient, userId) {

        return apiClient.getLiveTvRecordings({

            userId: userId,
            Limit: enableScrollX() ? 12 : 5,
            Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
            IsInProgress: false,
            EnableTotalRecordCount: false,
            IsLibraryItem: false

        }).then(function (result) {

            var html = '';

            if (result.Items.length) {

                html += '<div class="sectionTitleContainer">';
                html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('HeaderLatestTvRecordings') + '</h2>';
                if (!layoutManager.tv) {
                    html += '<a href="livetv.html?tab=3" class="clearLink" style="margin-left:2em;"><button is="emby-button" type="button" class="raised more mini"><span>' + globalize.translate('ButtonMore') + '</span></button></a>';
                }
                html += '</div>';
            }

            if (enableScrollX()) {
                html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-mousewheel="false" data-centerfocus="true"><div is="emby-itemscontainer" class="scrollSlider focuscontainer-x padded-left padded-right">';
            } else {
                html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x">';
            }

            html += cardBuilder.getCardsHtml({
                items: result.Items,
                shape: enableScrollX() ? 'autooverflow' : 'auto',
                showTitle: true,
                showParentTitle: true,
                coverImage: true,
                lazy: true,
                showDetailsMenu: true,
                centerText: true,
                overlayText: false,
                overlayPlayButton: true,
                allowBottomPadding: !enableScrollX(),
                preferThumb: true,
                cardLayout: false

            });

            if (enableScrollX()) {
                html += '</div>';
            }

            html += '</div>';

            elem.innerHTML = html;
            imageLoader.lazyChildren(elem);
        });
    }

    return {
        loadRecentlyAdded: loadRecentlyAdded,
        loadLatestChannelMedia: loadLatestChannelMedia,
        loadLibraryTiles: loadLibraryTiles,
        loadResumeVideo: loadResumeVideo,
        loadResumeAudio: loadResumeAudio,
        loadActiveRecordings: loadActiveRecordings,
        loadNextUp: loadNextUp,
        loadLatestChannelItems: loadLatestChannelItems,
        loadLatestLiveTvRecordings: loadLatestLiveTvRecordings,
        loadlibraryButtons: loadlibraryButtons,
        loadSection: loadSection
    };
});