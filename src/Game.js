import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Sound from 'react-sound';
import './Game.css';
import './helpers.css';
import {select_sound} from './helpers.js';
import Timer from './Timer.js';
import sounds from './sounds.js';

const City = require('./objectCountry.json');
var FontAwesome = require('react-fontawesome');

const SECONDS = 60;

class Game extends Component {
    constructor(props){
        super(props);

        this.state = {
            // is game on?
            playing: false,

            // time
            seconds: SECONDS,
            timerRun: true,

            // voices
            voices: true,

            // sounds
            sounds: true,
            soundStatus: 'stop',
            soundName: '',

            // objects
            country: '',
            objCountry: '',
            city: '',

            // display
            display: true,

            // value input
            inputValue: '',

            // score
            score: 0,

            // disabled input
            disabled: false,
        };

        this.turnVoices = this.turnVoices.bind(this);
        this.turnSound = this.turnSound.bind(this);
        this.controlDisplay = this.controlDisplay.bind(this);
        this.setTime = this.setTime.bind(this);
        // handle time update from timer
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        // handle keys
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        // new game function
        this.newGame = this.newGame.bind(this);

        this.handleFinishedPlaying = this.handleFinishedPlaying.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    componentDidMount() {
        this.newGame();
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    // turn voices off/on
    turnVoices() {
        this.setState({
            voices: !this.state.voices
        }, () => !this.state.voices ? window.responsiveVoice.cancel() : window.responsiveVoice.speak(" ", "Czech Female"));

        this.buttonVoices.blur();
    }

    // turn sounds off/on
    turnSound() {
        this.setState({
            sounds: !this.state.sounds
        });

        this.buttonSounds.blur();
    }

    // display controls - blind mode
    controlDisplay() {
        this.setState({
            display: !this.state.display
        });

        this.buttonDisplay.blur();
    }

    // timer update - to (in/de)crease actual time by specified time (seconds)
    setTime(currentTime, sec) {
        if(!this.state.playing) return 60;
        const inc = sec < 0;

        if (inc) {
            return (currentTime + sec) > 60 ? 60 : currentTime + sec;
        } else {
            return (currentTime + sec) < 0 ? 0 : currentTime + sec;
        }
    }

    // remove listeners
    removeListeners(){
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    // add listeners
    addListeners() {
        this.newGame();
        // add key listener
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    // generate random object from json array
    generateNewCountry(Arr) {
        let randomNumber = Math.floor(Math.random() * Arr.length)+1;
        let generateCountry = Arr[randomNumber];
        return generateCountry;
    }

    // get value from text input and save to state
    getValueInput () {
        let enteredWord  = this.state.inputValue;
        this.setState({
            inputValue: enteredWord
        });
    }

    // handle keyDown - move player by 'Arrow keys', 'Alt' to read possible directions
    handleKeyDown(e) {
        if (!this.state.playing || !this.state.timerRun) {
            if (e.keyCode === 82) {
                e.preventDefault(); // cancel focus event from turn voices button
                this.newGame();
            } else {
                return;
            }
        }

        switch (e.keyCode) {
            case 18: // alt read question
                if (e.keyCode === 18) {
                    e.preventDefault();
                        this.setState({
                            timerRun: false
                        });
                    if (!this.state.voices) return;
                    this.reader();
                }
                break;

            case 13: // confirmation entered answers
                if (e.keyCode === 13) {
                let lastCorrect = this.state.city;
                    e.preventDefault();
                    this.getValueInput();
                    this.compareAnswer();
                    let objCountry = this.generateNewCountry(City);
                    let newCountry = objCountry.country;
                    let city = objCountry.headCity;

                    this.setState({
                        objCountry: objCountry,
                        country: newCountry,
                        city: city,
                        timerRun: false
                    });

                    if(this.state.soundName === "success") {
                        this.reader();
                    }

                    if (this.state.soundName === "failure") {
                        window.responsiveVoice.speak("Správná odpověď byla " + lastCorrect + " Jaké je hlavní město " + this.state.country, "Czech Female",{onend: this.onEnd});
                    }
                }
                break;
            default:
                break;
        }
    }

    // compare my answer with correct answer
    compareAnswer() {
        let correctAnswer = this.state.city;
        let myAnswer = this.state.inputValue;
        let newScore = 10;
        let newTime = 5;
        if (myAnswer === correctAnswer) {
            this.setState({
                soundStatus: 'play',
                soundName: 'success',
                score: this.state.score + newScore,
                country: '',
                inputValue: '',
                seconds: this.state.seconds + newTime
            });
        } else {
            this.setState({
                soundStatus: 'play',
                soundName: 'failure',
                inputValue: '',
                seconds: this.state.seconds - newTime
            });
        }
    }

    // reader for sentences
    reader() {
        window.responsiveVoice.speak("Jaké je hlavní město " + this.state.country, "Czech Female",{onend: this.onEnd});
    }

    // function onend
    onEnd() {
        this.setState({
            timerRun: true
        });
    }

    // handle keyUp
    handleKeyUp(e) {
        if (!this.state.playing) return;
    }

    // handle finish sound playing
    handleFinishedPlaying() {
        this.setState({
            soundStatus: 'stop'
        });
    }

    // init new game
    newGame() {
        let objCountry = this.generateNewCountry(City);
        ReactDOM.findDOMNode(this.input).focus();
        let city = objCountry.headCity;
        let country = objCountry.country;

        this.setState({
            playing: true,
            seconds: SECONDS,
            timerRun: true,
            score: 0,
            objCountry: objCountry,
            country: country,
            city: city,
            disabled: false
        }, () => {
            window.responsiveVoice.speak('Jaké je hlavní město ' + this.state.country, "Czech Female", {onend: this.onEnd});

            this.buttonRefresh.blur();
        });
    }

    // handle time update
    handleTimeUpdate(seconds) {
        this.setState({
            seconds
        });

        if (seconds === 3) {
            this.setState({
                soundStatus: 'play',
                soundName: 'tick',
            });
        } else if (seconds === 0 || seconds < 0) {
            this.setState({
                playing: false,
                timerRun: false,
                disabled: true
            });
            window.responsiveVoice.speak("Konec hry " + this.state.score + " bodů", "Czech Female");
            this.removeListeners();
        }
    }

    render() {
        const {
            playing,
            timerRun,
            seconds,
            display,
            sounds: stateSounds,
            voices
        } = this.state;

        let iconVoices = voices ? <FontAwesome name='toggle-on' size='2x' /> : <FontAwesome name='toggle-off' size='2x' />;
        let iconSounds = stateSounds ? <FontAwesome name='volume-up' size='2x' /> : <FontAwesome name='volume-off' size='2x' />;
        let iconDisplay = display ? <FontAwesome name='eye-slash' size='4x' /> : <FontAwesome name='eye' size='4x' />;

        return (
            <div className="Game">
                <header>
                    {/* <h1>ProjectName<span>Easy</span></h1> */}

                    <div className="options">
                        <button onClick={this.newGame} ref={(buttonRefresh) => { this.buttonRefresh = buttonRefresh; }}>
                            <FontAwesome name='refresh' size='2x' />
                        </button>

                        <button onClick={this.turnSound} ref={(buttonSounds) => { this.buttonSounds = buttonSounds; }}>
                            {iconSounds}
                        </button>

                        <button className="speech-btn" onClick={this.turnVoices} ref={(buttonVoices) => { this.buttonVoices = buttonVoices; }}>
                            {iconVoices}
                            <span>číst</span>
                        </button>
                    </div>
                </header>

                <div className={display ? 'Playground__area' : 'Playground__area blur'}>
                    {
                        !this.state.display
                            ? <div className="overlay"/>
                            : null
                    }
                    <div className="country__container">
                        <p className="country">
                           Jaké je hlavní město {this.state.country}?
                        </p>
                    </div>

                </div>

                <div className="word__container">
                    <form>
                        <input id="myWord" type="text"

                               disabled={this.state.disabled}
                               autoFocus="autoFocus"
                               autoComplete="off"
                               onChange={(e) => { this.setState({inputValue:e.target.value}) }}
                               value={this.state.inputValue}
                               ref={(input) => this.input = input}
                        />
                    </form>
                </div>

                <div className="options options-display">
                    <button onClick={this.controlDisplay} ref={(buttonDisplay) => this.buttonDisplay = buttonDisplay}>
                        {iconDisplay}
                    </button>
                </div>

                {
                    playing && seconds > 0
                        ? <Timer status={timerRun} duration={seconds} timeCallback={this.handleTimeUpdate} />
                        : null
                }

                {
                    !this.state.sounds || this.state.soundStatus !== 'play'
                        ? null
                        : (
                        <Sound
                            url={select_sound(sounds, this.state.soundName).url}
                            playStatus={'PLAYING'}
                            volume={100}
                            onFinishedPlaying={this.handleFinishedPlaying}
                        />
                    )
                }

                <div className="score">
                    {this.state.score}
                    <span> points</span>
                </div>

                <footer>
                    {/* Powered by <a href="http://evalue.cz/">eValue.cz</a> */}
                </footer>
            </div>
        );
    }
}

export default Game;