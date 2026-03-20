# afrihealth
````powershell
 git clone https://github.com/steeven-hub/afrihealth
cd afrihealth
python -m venv venv
venv\Scripts\activate        # ou source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
