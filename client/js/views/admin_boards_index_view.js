/**
 * @fileOverview This file has functions related to board index view. This view calling from apllication view.
 * Available Object:
 *	App.boards						: this object contain all boards(Based on logged in user)
 *	this.model						: undefined
 */
if (typeof App == 'undefined') {
    App = {};
}
/**
 * BoardsIndex View
 * @class AdminBoardsIndexView
 * @constructor
 * @extends Backbone.View
 */
App.AdminBoardsIndexView = Backbone.View.extend({
    /**
     * Constructor
     * initialize default values and actions
     */
    initialize: function(options) {
        this.filter_count = options.filter_count;
        if (!_.isUndefined(this.model) && this.model !== null) {
            this.model.showImage = this.showImage;
        }
        this.render();
    },
    template: JST['templates/admin_board_index'],
    tagName: 'section',
    className: 'clearfix',
    /**
     * Events
     * functions to fire on events (Mouse events, Keyboard Events, Frame/Object Events, Form Events, Drag Events, etc...)
     */
    events: {
        'change .js-more-action-user': 'boardsMoreActions',
        'click .js-delete-board': 'deleteBoard',
        'click .js-sort': 'sortBoard',
        'click .js-filter': 'filterBoard',
    },
    /**
     * deleteBoard()
     * delete board
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    deleteBoard: function(e) {
        if (confirm($(e.currentTarget).data('confirm'))) {
            var dataUrl = $(e.currentTarget).attr('href');

            var board = new App.Board();
            board.url = api_url + dataUrl + '.json';
            board.set('id', '-1');
            board.destroy({
                success: function() {
                    Backbone.history.loadUrl();
                }
            });
        }
        return false;
    },
    /**
     * render()
     * populate the html to the dom
     * @param NULL
     * @return object
     *
     */
    render: function() {
        this.$el.html(this.template({
            'board': this.model,
            filter_count: this.filter_count
        }));
        $('.js-admin-board-menu').addClass('active');
        $('.js-admin-activity-menu, .js-admin-setting-menu, .js-admin-email-menu, .js-admin-role-menu, .js-admin-user-menu').removeClass('active');
        this.showTooltip();
        return this;
    },
    /**	
     * filterBoard()
     * @param NULL
     * @return object
     *
     */
    filterBoard: function(e) {
        var _this = this;
        _this.current_page = (!_.isUndefined(_this.current_page)) ? _this.current_page : 1;
        _this.filterField = (!_.isUndefined(e)) ? $(e.currentTarget).data('filter') : _this.filterField;
        var boards = new App.BoardCollection();
        if (!_.isUndefined(e)) {
            _this.current_page = 1;
        }
        boards.url = api_url + 'boards.json?page=' + _this.current_page + '&filter=' + _this.filterField;
        app.navigate('#/' + 'boards/list?page=' + _this.current_page + '&filter=' + _this.filterField, {
            trigger: false,
            trigger_function: false,
        });
        $('.js-my-boards').html('');
        boards.fetch({
            cache: false,
            abortPending: true,
            success: function(boards, response) {
                if (boards.length !== 0) {
                    boards.each(function(board) {
                        $('.js-my-boards').append(new App.AdminBoardView({
                            model: board
                        }).el);
                    });
                } else {
                    $('.js-my-boards').html('<tr><td class="text-center" colspan="12">No record found</td></tr>');
                }
                $('.js-filter-list').children().removeClass('active');
                $("[data-filter=" + _this.filterField + "]").parent().addClass('active');
                $('.js-my-boards').find('.timeago').timeago();
                $('.pagination-boxes').unbind();
                $('.pagination-boxes').pagination({
                    total_pages: response._metadata.noOfPages,
                    current_page: _this.current_page,
                    display_max: 4,
                    callback: function(event, page) {
                        event.preventDefault();
                        if (page) {
                            _this.current_page = page;
                            _this.filterBoard();
                        }
                    }
                });
            }
        });
    },
    /**
     * sortBoard()
     * @param NULL
     * @return object
     *
     */
    sortBoard: function(e) {
        var _this = this;
        _this.current_page = (!_.isUndefined(_this.current_page)) ? _this.current_page : 1;
        _this.sortField = (!_.isUndefined(e)) ? $(e.currentTarget).data('field') : _this.sortField;
        _this.sortDirection = (!_.isUndefined(e)) ? $(e.currentTarget).data('direction') : _this.sortDirection;
        var boards = new App.BoardCollection();
        if (!_.isUndefined(_this.sortDirection) && !_.isUndefined(_this.sortField)) {
            boards.setSortField(_this.sortField, _this.sortDirection);
            boards.url = api_url + 'boards.json?page=' + _this.current_page + '&sort=' + _this.sortField + '&direction=' + _this.sortDirection;
            app.navigate('#/' + 'boards/list?page=' + _this.current_page + '&sort=' + _this.sortField + '&direction=' + _this.sortDirection, {
                trigger: false,
                trigger_function: false,
            });
        } else {
            boards.url = api_url + 'boards.json?page=' + _this.current_page;
            app.navigate('#/' + 'boards/list?page=' + _this.current_page, {
                trigger: false,
                trigger_function: false,
            });
        }
        if (!_.isUndefined(e)) {
            if ($(e.currentTarget).data('direction') == 'desc') {
                $(e.currentTarget).data('direction', 'asc');
                $('span.icon-caret-up').addClass('hide');
                $('span.icon-caret-down').addClass('hide');
                $(e.currentTarget).siblings('span').removeClass('hide');
                $(e.currentTarget).find('span').removeClass('hide');
                $(e.currentTarget).find('span').removeClass('icon-caret-down').addClass('icon-caret-up');
                $(e.currentTarget).siblings('span').removeClass('icon-caret-down').addClass('icon-caret-up');
            } else {
                $(e.currentTarget).data('direction', 'desc');
                $('span.icon-caret-up').addClass('hide');
                $('span.icon-caret-down').addClass('hide');
                $(e.currentTarget).siblings('span').removeClass('hide');
                $(e.currentTarget).find('span').removeClass('hide');
                $(e.currentTarget).find('span').removeClass('icon-caret-up').addClass('icon-caret-down');
                $(e.currentTarget).siblings('span').removeClass('icon-caret-up').addClass('icon-caret-down');
            }
        }
        $('.js-my-boards').html('');
        boards.fetch({
            cache: false,
            abortPending: true,
            success: function(boards, response) {
                boards.each(function(board) {
                    $('.js-my-boards').append(new App.AdminBoardView({
                        model: board
                    }).el);
                });
                $('.js-my-boards').find('.timeago').timeago();
                $('.pagination-boxes').unbind();
                $('.pagination-boxes').pagination({
                    total_pages: response._metadata.noOfPages,
                    current_page: _this.current_page,
                    display_max: 4,
                    callback: function(event, page) {
                        event.preventDefault();
                        if (page) {
                            _this.current_page = page;
                            _this.sortBoard();
                        }
                    }
                });
            }
        });
    },
    boardsMoreActions: function(e) {
        var self = this;
        if (_.isUndefined($('.js-checkbox-list:checked').val())) {
            alert('Please select atleast one record!');
            $("#js-more-action").val('0');
            return false;
        } else {
            if (window.confirm(i18next.t('Are you sure you want to do this action?'))) {
                var Board = Backbone.Model.extend({});
                var Boards = Backbone.BatchCollection.extend({
                    model: Board,
                    url: api_url + 'boards/bulk_action.json?token=' + api_token
                });
                var boards = new Boards();
                var data = {};
                $(':checkbox:checked').each(function(i) {
                    data[i] = {};
                    data[i].board_id = $(this).val();
                });
                data.action_id = {};
                data.action_id.action_id = $("#js-more-action option:selected").val();
                boards.add(data, {
                    silent: true
                });
                boards.save({
                    'success': function(response) {
                        if (!_.isEmpty(response.success)) {
                            self.flash('success', i18next.t('Checked boards are closed successfully.'));
                            app.navigate('#/boards/list', {
                                trigger: true,
                            });
                        }
                    }
                });
            } else {
                $("#js-more-action").val('0');
                return false;
            }
        }
    }
});
