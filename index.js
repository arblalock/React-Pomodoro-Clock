const {render} = ReactDOM;
const {connect, Provider} = ReactRedux;
const {createStore, combineReducers} = Redux;

const SESSION = "SESSION";
const BREAK = "BREAK";
const MODE = "MODE";
const COUNTDOWN = "COUNTDOWN";
const RESET = "RESET"

const changeSession = (incdec) => ({type: SESSION, incdec})
const changeBreak = (incdec) => ({type: BREAK, incdec})
const changeMode = (sb) => ({type: MODE, sb})

const changeCount = (isCounting) => ({type: COUNTDOWN, isCounting})

const resetAll = () => ({type: RESET})

const initial_state = {
  session: 25,
  break: 5,
  mode: "Session",
  counting: false
};

const timeReducer = (state = initial_state, action) => {
  let newval;
  switch (action.type) {
    case SESSION:
      newval = action.incdec == "inc"
        ? state.session + 1
        : state.session - 1;
      return (Object.assign({}, state, {session: newval}));
    case BREAK:
      newval = action.incdec == "inc"
        ? state.break + 1
        : state.break - 1;
      return (Object.assign({}, state, {break: newval}));
    case MODE:
      return (Object.assign({}, state, {mode: action.sb}));
    case COUNTDOWN:
      return (Object.assign({}, state, {counting: action.isCounting}));
    case RESET:
      return (Object.assign({}, state, initial_state))
    default:
      return state;
  }
}

const timerFormat = (time) => {
  let min = Math.floor(time / 60);
  let sec = time - min * 60
  let minstr = min < 10
    ? "0" + min.toString()
    : min.toString();
  let secstr = sec < 10
    ? "0" + sec.toString()
    : sec.toString();
  return `${minstr}:${secstr}`
}

const store = createStore(timeReducer)

class Break extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(incdec) {
    if (this.props.counting == false) {
      if ((this.props.break >= 60 && incdec == 'inc' || this.props.break <= 1 && incdec == 'dec')) {
        return
      }
      this.props.changeBreak(incdec)
    }
  }
  render() {
    return (<div className="sb-row">
      <div className="sb-title" id="break-label">Break Length</div>
      <div className="sb-number" id="break-length">{this.props.break}</div>
      <div>
        <button onClick={() => this.handleClick('inc')} className="sb-button" id="break-increment">
          <i className="fas fa-arrow-up"></i>
        </button>
        <button onClick={() => this.handleClick('dec')} className="sb-button" id="break-decrement">
          <i className="fas fa-arrow-down"></i>
        </button>
      </div>
    </div>)
  }
}

class Session extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(incdec) {
    if (this.props.counting == false) {
      if ((this.props.session >= 60 && incdec == 'inc' || this.props.session <= 1 && incdec == 'dec')) {
        return
      }
      this.props.changeSession(incdec)
    }
  }
  render() {
    return (<div className="sb-row">
      <div className="sb-title" id="session-label">Session Length</div>
      <div className="sb-number" id="session-length">{this.props.session}</div>
      <div>
        <button onClick={() => this.handleClick('inc')} className="sb-button" id="session-increment">
          <i className="fas fa-arrow-up"></i>
        </button>
        <button onClick={() => this.handleClick('dec')} className="sb-button" id="session-decrement">
          <i className="fas fa-arrow-down"></i>
        </button>
      </div>
    </div>)
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.timer = null;
    this.state = {
      sec: this.props.session * 60,
      session: this.props.session,
      break: this.props.break,
      changingM: false
    }
    this.decTime = this.decTime.bind(this)
    this.toggleTimer = this.toggleTimer.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
    this.resetTimer = this.resetTimer.bind(this)
    this.switchMode = this.switchMode.bind(this)
    this.aud = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.mode == "Session") {
      if (prevProps.session != this.props.session) {
        this.setState({
          sec: this.props.session * 60
        })
      }
    } else if (prevProps.break != this.props.break) {
      this.setState({
        sec: this.props.break * 60
      })
    }
    if (this.state.sec < 0 && this.state.changingM == false) {
      this.aud.current.play();
      this.setState({changingM: true})
      this.stopTimer();
    }
    if (this.state.changingM == true && this.props.counting == false) {
      this.switchMode();
    }
  }

  decTime() {
    this.setState({
      sec: this.state.sec - 1
    })
  }

  toggleTimer() {
    if (this.props.counting) {
      this.stopTimer();
    } else {
      this.props.changeCount(true)
      this.timer = setInterval(() => this.decTime(), 1000)
    }
  }
  componentWillUnmount() {
    this.stopTimer();
  }

  stopTimer() {
    clearInterval(this.timer)
    this.props.changeCount(false)
  }

  resetTimer() {
    this.aud.current.pause();
    this.aud.current.currentTime = 0;
    this.stopTimer();
    this.props.changeCount(false)
    this.props.resetAll()
    this.setState({
      sec: this.props.session * 60
    });
  }

  switchMode() {
    let newM = this.props.mode == "Session"
      ? "Break"
      : "Session";
    this.props.changeMode(newM)
    let newSec = newM == "Session"
      ? "session"
      : "break";
    this.setState({
      sec: this.props[newSec] * 60
    })
    this.toggleTimer();
    this.setState({changingM: false})
  }

  render() {
    return (<div className="time-cont">
      <div className="timer-head" id="timer-label">{this.props.mode}</div>
      <div className="timer-num" id="time-left">{timerFormat(this.state.sec)}</div>
      <div className="btn-row">
        <button onClick={this.toggleTimer} className="sb-button" id="start_stop">
          <i className="fas fa-play"></i>
          <i className="fas fa-pause"></i>
        </button>
        <button onClick={this.resetTimer} className="sb-button" id="reset">
          <i className="fas fa-redo-alt"></i>
        </button>
        <audio ref={this.aud} src="https://goo.gl/65cBl1" id="beep"/>
      </div>
    </div>)
  }
}

const MapStateToProps = (state) => {
  return state

}

const MapSesToProps = (dispatch) => ({
  changeSession: (incdec) => dispatch(changeSession(incdec))
})
const MapBreakToProps = (dispatch) => ({
  changeBreak: (incdec) => dispatch(changeBreak(incdec))
})
const MapActionsToProps = (dispatch) => ({
  changeMode: (sb) => dispatch(changeMode(sb)),
  changeCount: (isCounting) => dispatch(changeCount(isCounting)),
  resetAll: () => dispatch(resetAll())
})

Break = connect(MapStateToProps, MapBreakToProps)(Break);
Session = connect(MapStateToProps, MapSesToProps)(Session);
Timer = connect(MapStateToProps, MapActionsToProps)(Timer);

const OCont = () => (<div className="cont">
  <div className="sb-cont">
    <Break/>
    <Session/>
  </div>
  <Timer/>
</div>)

class AppWrapper extends React.Component {
  render() {
    return (<Provider store={store}>
      <OCont/>
    </Provider>)
  }
}

render(<AppWrapper/>, document.getElementById('app'))
