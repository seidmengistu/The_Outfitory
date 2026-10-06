from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests
import utils as u
import os


#Middlewares
from middlewares.authorize_request import authenticate_request


app = Flask(__name__)
CORS(app)

from routes.users import users_bp
from routes.clothes_gateway import clothes_bp
from routes.outfit_gateway import outfit_bp
from routes.travel_gateway import travel_bp
from routes.collection_gateway import collection_bp
from routes.calendar_gateway import calendar_bp
from routes.upload_gateway import upload_bp


#Apply middlewares
users_bp.before_request(
    authenticate_request(
        #Esempio di path non sotto autenticazione, praticamente un override
        exempt_paths=("/login","/register")
    )
)
outfit_bp.before_request(
    authenticate_request(
        #Esempio di path non sotto autenticazione, praticamente un override
        #exempt_paths=("/user/login", "/user/register")
    )
)
clothes_bp.before_request(
    authenticate_request(
        #Esempio di path non sotto autenticazione, praticamente un override
        #exempt_paths=("/user/login", "/user/register")
    )
)
collection_bp.before_request(
    authenticate_request(
        #Esempio di path non sotto autenticazione, praticamente un override
        #exempt_paths=("/user/login", "/user/register")
    )
)
upload_bp.before_request(
    authenticate_request(
        #Esempio di path non sotto autenticazione, praticamente un override
        #exempt_paths=("/user/login", "/user/register")
    )
)
travel_bp.before_request(
    authenticate_request(
        # All travel endpoints require authentication
    )
)

app.register_blueprint(users_bp,       url_prefix='/')
app.register_blueprint(outfit_bp)
app.register_blueprint(travel_bp)
app.register_blueprint(collection_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(clothes_bp)
app.register_blueprint(upload_bp)


# Configurazione per Upload foto
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return {"message": "API Gateway is running"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
