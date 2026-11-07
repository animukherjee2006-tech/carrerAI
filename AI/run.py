
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = app.config["AI_PORT"]
    debug = app.config["DEBUG"]

    app.run(
        host="127.0.0.1",
        port=port,
        debug=debug
    )
