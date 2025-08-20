# Nom du déploiement, utilisé comme préfixe pour tous les noms de ressources.
variable "deployment_name" {
  description = "Nom du déploiement (préfixe pour les ressources AWS)."
  type        = string
}

# Type de base de données à déployer.
variable "database_engine" {
  description = "Type de base de données: rds-mysql | rds-postgres | aurora-mysql | aurora-postgres | dynamodb | none"
  type        = string
  default     = "none"
}

# Nom d'utilisateur de la base de données.
variable "db_username" {
  description = "Nom d'utilisateur pour la base de données."
  type        = string
  default     = "admin"
}

# Mot de passe de la base de données.
variable "db_password" {
  description = "Mot de passe de la base de données."
  type        = string
  sensitive   = true
}

# Nom de la base de données.
variable "db_name" {
  description = "Nom de la base de données principale à créer."
  type        = string
  default     = "appdb"
}

# Classe d'instance RDS ou Aurora (ex: db.t3.micro).
variable "instance_class" {
  description = "Classe d'instance de la base de données (ex: db.t3.micro)."
  type        = string
  default     = "db.t3.micro"
}

# Activer le déploiement multi-AZ pour haute disponibilité.
variable "multi_az" {
  description = "Déploie la base de données sur plusieurs zones de disponibilité si vrai."
  type        = bool
  default     = false
}

# Activer la création d'une réplique en lecture (RDS).
variable "enable_read_replica" {
  description = "Créer une réplique de lecture pour RDS si vrai."
  type        = bool
  default     = false
}

# Taille de stockage allouée (en Go).
variable "allocated_storage" {
  description = "Taille de stockage allouée pour la base de données en Go."
  type        = number
  default     = 20
}

# Liste des zones de disponibilité dans lesquelles déployer la base.
variable "availability_zones" {
  description = "Liste des zones de disponibilité à utiliser pour RDS ou Aurora."
  type        = list(string)
  default     = []
}

# Liste des sous-réseaux privés où déployer la base de données.
variable "private_subnet_ids" {
  description = "Identifiants des sous-réseaux privés pour la base de données."
  type        = list(string)
}

# ID du groupe de sécurité pour la base de données.
variable "security_group_id" {
  description = "Groupe de sécurité autorisant l'accès à la base de données."
  type        = string
}

# Liste des groupes de sécurité supplémentaires.
variable "additional_security_groups" {
  description = "Groupes de sécurité supplémentaires à attacher à la base de données."
  type        = list(string)
  default     = []
}

# Tags communs appliqués à toutes les ressources.
variable "tags" {
  description = "Map de tags à appliquer à toutes les ressources."
  type        = map(string)
  default     = {}
}