import m from 'mithril';

(function (global, factory) {
    "use strict";

    if (typeof m != 'function') {
        throw 'This game requires Mithril.js framework.';
    }

    global.Colors = factory();
})(window || {}, function () {
    let timeout, initialTime = 2500, time, howManyColors = 4;
    time = initialTime;

    const colors = {
        list: ['red', 'green', 'black', 'gray', 'blue', 'cyan', 'pink', 'yellow', 'magenta', 'lime', 'orange', 'olive'],
        getColors: () => colors.list.slice(0, howManyColors),
        random: () => colors.getColors()[Math.floor(Math.random() * colors.getColors().length)],
        correct: m.prop(),
        incorrect: m.prop(),
        check: (color) => color === colors.correct(),
        update: () => {
            colors.correct(colors.random());
            colors.incorrect(colors.random());
            timeout = setTimeout(game.end, time);
        },
        select: (color) => {
            if (game.hasEnded()) return;

            if (colors.check(color)) {
                clearTimeout(timeout);
                game.levelUp();
                colors.update();
            } else {
                game.end();
            }
        }
    };

    const components = {};
    components.randomColor = () => m('div', {
        style: {
            color: colors.correct()
        }
    }, colors.incorrect());

    components.colorListItem = (color) => m('li', {
        onclick: colors.select.bind(null, color),
        style: {color}
    }, color);

    components.endResults = () => m('div', 'Oops, you ran out of time. Your score is ' + game.score);

    components.restartButton = () => m('div', m('button.btn.btn-primary', {
        onclick: game.restart
    }, 'Restart'));

    components.startScreen = () => m('.jumbotron', [
        m('h2', 'Welcome to this awesome game!'),
        m('div', 'Your objective is simple: select the color of that bigger word, not the color it says it is!'),
        m('div', m('strong', ' Remember: '), 'You have ' + initialTime / 1000 + ' seconds and counting down.'),
        m('.text-center', m('button.btn.btn-primary', {
            onclick: game.start.bind(game)
        }, 'Start!'))
    ]);
    
    components.gameInfo = () => m('div', 'You have ' + time / 1000 + ' seconds to choose:');

    const game = {
        score: 0,
        loadGameComponents: m.prop(false),
        hasEnded: m.prop(false),
        levelUp: () => {
            game.score++;
            time = time - game.score * 10;
            
            if (howManyColors >= colors.list.length) return;

            if (game.score > 0 && game.score % 3 == 0) {
                howManyColors++;
            }
        },
        end: () => {
            game.hasEnded(true);
            m.redraw();
        },
        start: () => {
            game.loadGameComponents(true);
            colors.update();
        },
        restart: () => {
            game.hasEnded(false);
            game.score = 0;
            time = initialTime;
            howManyColors = 4;
            colors.update();
        },
        view: () => m('.container', game.loadGameComponents() ? components.gameComponents() : components.startScreen())
    };

    components.gameComponents = () => m('.text-center', [
        components.randomColor(),
        components.gameInfo(),
        m('ul.list-unstyled', colors.getColors().map(components.colorListItem)),
        game.hasEnded() ? [components.endResults(), components.restartButton()] : null
    ]);

    m.mount(document.body, game);
});
