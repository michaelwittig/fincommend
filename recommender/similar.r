library(lsa)
library(rmongodb)


# instruments <- matrix(data = 0, nrow = 15, ncol = 10)
# rownames(instruments) <- c("country_DE", "branch_Sportartikel", "branch_Chemie", "branch_Drogerie", "branch_Versicherungen", "branch_Automobilproduktion", "branch_Automobilzulieferer", "branch_Banken", "branch_Spezialchemie", "branch_Banken", "branch_Finanzdienstleistungen", "sector_Konsum", "sector_Chemie", "sector_Finanzen", "sector_KFZ")
# colnames(instruments) <- c("DE000A1EWWW0", "DE000BASF111", "DE0005200000", "DE0008404005", "DE0005190003", "DE0005439004", "DE0005140008", "DE000BAY0017", "DE000CBK1001", "DE0005810055")

# instruments[c("country_DE", "branch_Sportartikel", "sector_Konsum"),1] <- 1
# instruments[c("country_DE", "branch_Chemie", "sector_Chemie"),2] <- 1
# instruments[c("country_DE", "branch_Drogerie", "sector_Konsum"),3] <- 1
# instruments[c("country_DE", "branch_Versicherungen", "sector_Finanzen"),4] <- 1
# instruments[c("country_DE", "branch_Automobilproduktion", "sector_KFZ"),5] <- 1
# instruments[c("country_DE", "branch_Automobilzulieferer", "sector_KFZ"),6] <- 1
# instruments[c("country_DE", "branch_Banken", "sector_Finanzen"),7] <- 1
# instruments[c("country_DE", "branch_Spezialchemie", "sector_Chemie"),8] <- 1
# instruments[c("country_DE", "branch_Banken", "sector_Finanzen"),9] <- 1
# instruments[c("country_DE", "branch_Finanzdienstleistungen", "sector_Finanzen"),10] <- 1

# my_similarity <- cosine(instruments)

# my_similarity[c(8,9,10), ]

# c("DE", "Sportartikel", "Konsum")
# instruments[,2] <- c("DE", "Chemie", "Chemie")
# instruments[,3] <- c("DE", "Drogerie und Kosmetikgüter", "Konsum")
# instruments[,4] <- c("DE", "Versicherungen", "Finanzen")
# instruments[,5] <- c("DE", "Automobilproduktion", "KFZ")
# instruments[,6] <- c("DE", "Automobilzulieferer", "KFZ")
# instruments[,7] <- c("DE", "Banken", "Finanzen")
# instruments[,8] <- c("DE", "Spezialchemie", "Chemie")
# instruments[,9] <- c("DE", "Banken", "Finanzen")
# instruments[,10] <- c("DE", "Finanzdienstleistungen", "Finanzen")

mongo_host <- "cmeasy.cinovo.de:27017"
mongo_db <- "cmeasy"

# instruments_col <- "cmeasy.instruments"
# country_key <- "country"
# branch_key <- "branch"
# sector_key <- "sector"
# id_key <- "_id"

# separator <- "_"

mongo <- mongo.create(host = mongo_host, db = mongo_db)

# countries <- mongo.distinct(mongo, instruments_col, country_key)
# branches <- mongo.distinct(mongo, instruments_col, branch_key)
# sectors <- mongo.distinct(mongo, instruments_col, sector_key)

# countries <- paste("country", countries, sep = separator)
# branches <- paste("branch", branches, sep = separator)
# sectors <- paste("sector", sectors, sep = separator)

# instrument_features <- c(countries, branches, sectors)

# instrument_ids <- mongo.distinct(mongo, instruments_col, id_key)

# instruments <- matrix(data = 0, nrow = length(instrument_features), ncol = length(instrument_ids))

# rownames(instruments) <- instrument_features
# colnames(instruments) <- instrument_ids

# for(i in instrument_ids){
# 	curr_instr <- mongo.find.one(mongo, instruments_col, paste('{"_id":"', i, '"}', sep = ""))
# 	curr_instr_list <- mongo.bson.to.list(curr_instr)
# 	if(!is.null(curr_instr_list$country)){
# 		curr_country <- paste("country_", curr_instr_list$country, sep = "")
# 		instruments[curr_country, i] <- 1
# 	}

# 	if(!is.null(curr_instr_list$branch)){
# 		curr_branch <- paste("branch_", curr_instr_list$branch, sep = "")
# 		instruments[curr_branch, i] <- 1
# 	}

# 	if(!is.null(curr_instr_list$sector)){
# 		curr_sector <- paste("sector_", curr_instr_list$sector, sep = "")
# 		instruments[curr_sector, i] <- 1
# 	}
# }


test <- mongo.find.all(mongo, instruments_col)

relevant_isins <- c()

for(i in 1:length(test)){
	if(test[[i]]$volume >= 600.0) {relevant_isins <- c(relevant_isins, test[[i]]$'_id')}
}
























