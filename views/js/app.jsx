const AUTH0_CLIENT_ID = "XZOmDH20Kx50yfMBbs1bbZ_yv2k8qHOD";
const AUTH0_DOMAIN = "annguyen.auth0.com";
const AUTH0_CALLBACK_URL = location.href;
const AUTH0_API_AUDIENCE = "https://annguyen.auth0.com/api/v2/";

class App extends React.Component {
  parseHash() {
    this.auth0 = new auth0.WebAuth({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID
    });
    this.auth0.parseHash(window.location.hash, (err, authResult) => {
      if (err) {
        return console.log(err);
      }
      if (
        authResult !== null &&
        authResult.accessToken !== null &&
        authResult.idToken !== null
      ) {
        localStorage.setItem("access_token", authResult.accessToken);
        localStorage.setItem("id_token", authResult.idToken);
        localStorage.setItem(
          "profile",
          JSON.stringify(authResult.idTokenPayload)
        );
        window.location = window.location.href.substr(
          0,
          window.location.href.indexOf("#")
        );
      }
    });
  }

  setup() {
    $.ajaxSetup({
      beforeSend: (r) => {
        if (localStorage.getItem("access_token")) {
          r.setRequestHeader(
            "Authorization",
            "Bearer " + localStorage.getItem("access_token")
          );
        }
      }
    });
  }

  setState() {
    let idToken = localStorage.getItem("id_token");
    if (idToken) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  componentWillMount() {
    this.setup();
    this.parseHash();
    this.setState();
  }

  render() {
    if (this.loggedIn) {
      return <LoggedIn />;
    }
    return <Home />;
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.authenticate = this.authenticate.bind(this);
  }
  authenticate() {
    this.WebAuth = new auth0.WebAuth({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      scope: "openid profile",
      audience: AUTH0_API_AUDIENCE,
      responseType: "token id_token",
      redirectUri: AUTH0_CALLBACK_URL
    });
    this.WebAuth.authorize();
  }

  render() {
    return (
      <div >
          <div className="items">
              <div className="item intro span-2">
                  <h1>Parallelism</h1>
                  <p>A responsive portfolio site<br/>
                      template by HTML5 UP</p>
              </div>
              <article className="item thumb span-1">
                  <h2>You really got me</h2>
                  <a href="images/fulls/01.jpg" className="image"><img src="images/thumbs/01.jpg" alt="" /></a>
              </article>
              <article className="item thumb span-2">
                  <h2>Ad Infinitum</h2>
                  <a href="images/fulls/02.jpg" className="image"><img src="images/thumbs/02.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-1">
                  <h2>Different.</h2>
                  <a href="images/fulls/03.jpg" className="image"><img src="images/thumbs/03.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-1">
                  <h2>Elysium</h2>
                  <a href="images/fulls/04.jpg" className="image"><img src="images/thumbs/04.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-3">
                  <h2>Kingdom of the Wind</h2>
                  <a href="images/fulls/05.jpg" className="image"><img src="images/thumbs/05.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-1">
                  <h2>The Pursuit</h2>
                  <a href="images/fulls/06.jpg" className="image"><img src="images/thumbs/06.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-2">
                  <h2>Boundless</h2>
                  <a href="images/fulls/07.jpg" className="image"><img src="images/thumbs/07.jpg" alt="" /></a>
              </article>

              <article className="item thumb span-2">
                  <h2>The Spectators</h2>
                  <a href="images/fulls/08.jpg" className="image"><img src="images/thumbs/08.jpg" alt="" /></a>
              </article>
          </div>
          <div className="items">

              <article className="item thumb span-3"><h2>Kingdom of the Wind</h2><a href="images/fulls/05.jpg"
                                                                                    className="image"><img
                  src="images/thumbs/05.jpg" alt="" /></a></article>
              <article className="item thumb span-1"><h2>The Pursuit</h2><a href="images/fulls/06.jpg"
                                                                            className="image"><img
                  src="images/thumbs/06.jpg" alt="" /></a></article>
              <article className="item thumb span-2"><h2>Boundless</h2><a href="images/fulls/07.jpg"
                                                                          className="image"><img
                  src="images/thumbs/07.jpg" alt="" /></a></article>
              <article className="item thumb span-2"><h2>The Spectators</h2><a href="images/fulls/08.jpg"
                                                                               className="image"><img
                  src="images/thumbs/08.jpg" alt="" /></a></article>
              <article className="item thumb span-1"><h2>You really got me</h2><a href="images/fulls/01.jpg"
                                                                                  className="image"><img
                  src="images/thumbs/01.jpg" alt="" /></a></article>
              <article className="item thumb span-2"><h2>Ad Infinitum</h2><a href="images/fulls/02.jpg"
                                                                             className="image"><img
                  src="images/thumbs/02.jpg" alt="" /></a></article>
              <article className="item thumb span-1"><h2>Different.</h2><a href="images/fulls/03.jpg" className="image"><img
                  src="images/thumbs/03.jpg" alt="" /></a></article>
              <article className="item thumb span-2"><h2>Kingdom of the Wind</h2><a href="images/fulls/05.jpg"
                                                                                    className="image"><img
                  src="images/thumbs/05.jpg" alt="" /></a></article>
              <article className="item thumb span-1"><h2>Elysium</h2><a href="images/fulls/04.jpg"
                                                                        className="image"><img
                  src="images/thumbs/04.jpg" alt="" /></a></article>
          </div>
      </div>
    );
  }
}

class LoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };

    this.serverRequest = this.serverRequest.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("profile");
    location.reload();
  }

  serverRequest() {
    $.get("http://0.0.0.0:3000/api/jokes", res => {
      this.setState({
        jokes: res
      });
    });
  }

  componentDidMount() {
    this.serverRequest();
  }

  render() {
    return (
      <div className="container">
        <br />
        <span className="pull-right">
          <a onClick={this.logout}>Log out</a>
        </span>
        <h2>Jokeish</h2>
        <p>Let's feed you with some funny Jokes!!!</p>
        <div className="row">
          <div className="container">
            {this.state.jokes.map(function(joke, i) {
              return <Joke key={i} joke={joke} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}

class Joke extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: "",
      jokes: []
    };
    this.like = this.like.bind(this);
    this.serverRequest = this.serverRequest.bind(this);
  }

  like() {
    let joke = this.props.joke;
    this.serverRequest(joke);
  }
  serverRequest(joke) {
    $.post(
      "http://0.0.0.0:3000/api/jokes/like/" + joke.id,
      { like: 1 },
      res => {
        console.log("res... ", res);
        this.setState({ liked: "Liked!", jokes: res });
        this.props.jokes = res;
      }
    );
  }

  render() {
    return (
      <div >
        {/*<div className="panel panel-default">*/}
          {/*<div className="panel-heading">*/}
            {/*#{this.props.joke.id}{" "}*/}
            {/*<span className="pull-right">{this.state.liked}</span>*/}
          {/*</div>*/}
          {/*<div className="panel-body joke-hld">{this.props.joke.joke}</div>*/}
          {/*<div className="panel-footer">*/}
            {/*{this.props.joke.likes} Likes &nbsp;*/}
            {/*<a onClick={this.like} className="btn btn-default">*/}
              {/*<span className="glyphicon glyphicon-thumbs-up" />*/}
            {/*</a>*/}
          {/*</div>*/}
        {/*</div>*/}
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("main"));
