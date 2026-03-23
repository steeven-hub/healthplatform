# afrihealth
﻿ Assurez vous de créer une base de données nommée *health_platform* avant d'utiliser les commandes suivantes
  N'oublier pas l'installation de git au préalable

 
````powershell
 git clone https://github.com/steeven-hub/afrihealth
cd afrihealth
python -m venv venv
venv\Scripts\activate        # ou source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
