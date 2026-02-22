from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openfoodfacts

app = Flask(__name__)
CORS(app) 

api = openfoodfacts.API(user_agent="CarbonFootprintApp/1.0")

@app.route('/')
def index():
    return render_template('index.html')

def calculate_carbon_foot_print(product_data):
    """
    Extracts Agribalyse LCA data and calculates the total kg CO2e per kg of product.
    """
    ecoscore_data = product_data.get('ecoscore_data', {})
    agribalyse = ecoscore_data.get('agribalyse', {})
    
    if not agribalyse:
        return None 
        

    co2_agriculture = agribalyse.get('co2_agriculture') or 0
    co2_packaging = agribalyse.get('co2_packaging') or 0
    co2_transport = agribalyse.get('co2_transport') or 0
    co2_distribution = agribalyse.get('co2_distribution') or 0
    co2_consumption = agribalyse.get('co2_consumption') or 0
    co2_processing = agribalyse.get('co2_processing') or 0 
    
    total_co2_per_kg = (co2_agriculture + co2_packaging + co2_transport + 
                        co2_distribution + co2_consumption + co2_processing)
                        
    return round(total_co2_per_kg, 3)

@app.route('/lookup', methods=['POST'])
def lookup_barcode():
    data = request.json
    # barcode = data.get('code')
    barcode = "6111242100992"
    
    if not barcode:
        return jsonify({"error": "No barcode provided"}), 400

    try:
        product = api.product.get(barcode, fields=[
            "product_name", 
            "brands", 
            "origins", 
            "manufacturing_places", 
            "ecoscore_data", 
            "ecoscore_grade",
            "packaging"
        ])
        
        if not product:
            return jsonify({"error": "Product not found"}), 404

        calculated_co2 = calculate_carbon_foot_print(product)
        product['calculated_co2_per_kg'] = calculated_co2

        return jsonify(product)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)