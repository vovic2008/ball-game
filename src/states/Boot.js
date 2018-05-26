/* eslint-disable indent */
import Phaser from 'phaser'

var filter
var sprite1
var hightscore = 1.01
export default class extends Phaser.State {
    preload () {
        // this.load.image('space', 'assets/pics/thalion-rain.png');
        // this.load.image('ball', 'assets/particles/bubble256.png');
        this.load.image('bg', 'assets/images/bg.png')
        this.load.image('ball', 'assets/images/bubble256.png')
        // this.load.script('abstractFilter', './src/filters/AbstractFilter.js')
    }

    create () {
        var fragmentSrc = [

            "precision mediump float;",

            "uniform float     time;",
            "uniform vec2      resolution;",
            "uniform vec2      mouse;",
            "uniform sampler2D      iChannel0;",
            "varying vec2      vTextureCoord;",

            "#define MAX_ITER 2",

            "void main( void )",
            "{",
            "vec2 v_texCoord = gl_FragCoord.xy / resolution;",

            "vec2 p =  v_texCoord * 10.0 - vec2(20.0);",
            "vec2 i = p;",
            "float c = 1.0;",
            "float inten = .1;",

            "for (int n = 0; n < MAX_ITER; n++)",
            "{",
            "float t = time * (1.0 - (3.0 / float(n+1)));",

            "i = p + vec2(cos(t - i.x) + sin(t + i.y),",
            "sin(t - i.y) + cos(t + i.x));",

            "c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),",
            "p.y / (cos(i.y+t)/inten)));",
            "}",

            "c /= float(MAX_ITER);",
            "c = 1.5 - sqrt(c);",

            "vec2 uv = vTextureCoord;",
            "float X = uv.x*25.+time;",
            "float Y = uv.y*25.+time;",
            "uv.y += cos(X+Y)*0.01*cos(Y);",
            "uv.x += sin(X-Y)*0.01*sin(Y);",
            "vec4 texColor1 = texture2D(iChannel0, uv);",
            "texColor1.rgb *= (1.0 / (1.8 - (c + 0.05)));",
            "texColor1.a = 0.1;",
            "gl_FragColor = texColor1;",
            "}"
        ];
        const docElement = document.documentElement
        const width = docElement.clientWidth
        const height = docElement.clientHeight

        sprite1 = this.add.tileSprite(0,0,width,height,'bg');
        sprite1.width = width
        sprite1.height = height
        filter = new Phaser.Filter(this,{
            iChannel0: { type: 'sampler2D', value: sprite1.texture, textureData: { repeat: false } }
        }, fragmentSrc)
        filter.setResolution(width, height)
        sprite1.filters = [ filter ]
        var delay = 0
        for (var i = 0; i < 20; i++) {
            var sprite = this.add.sprite(-100 + (this.world.randomX), height, 'ball')
            var currentSize = this.rnd.realInRange(0.1, 0.6)
            sprite.scale.set(currentSize)
            console.log('before: ' + i + ' ' + currentSize)
            var speed = this.rnd.between(2000, 16000)
            sprite.inputEnabled = true

            sprite.input.useHandCursor = true

            sprite.events.onInputDown.add(this.destroySprite, this, 1, currentSize)

            this.physics.enable([sprite], Phaser.Physics.ARCADE)
            //sprite.body.collideWorldBounds = true;
            //sprite.body.bounce.setTo(1, 1);
            //sprite.body.velocity.setTo(this.rnd.integerInRange(-200, 200), this.rnd.integerInRange(-200, 200));
            this.add.tween(sprite).to({y: -50}, speed, Phaser.Easing.Circular.Out, true, delay, -1, false)

            delay += 100
        }
    }

    destroySprite (sprite, priority, currentSize) {
        sprite.visible = false
        sprite.x = -100 + (this.world.randomX)
        this.time.events.add(Phaser.Timer.SECOND * this.rnd.integerInRange(1, 6), this.showSprite, this, sprite)
        console.log('Received Event before: ' + hightscore + ' - ' + currentSize)
        hightscore = hightscore.valueOf() + parseFloat(currentSize.valueOf())
        console.log('Received Event: ' + hightscore + ' - ' + currentSize)
    }

    showSprite (game, sprite) {
        game.visible = true
    }

    update () {
        filter.update(this.input.activePointer);
        hightscore = hightscore - 0.005
    }

    render () {
        // debug helper
    }
}
