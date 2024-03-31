#!/usr/bin/env bash

dfx identity use default

dfx generate backend
dfx deploy backend

sed -i '/^BACKEND_CANISTER_ID/d' .env

dfx canister id backend | awk '{print "BACKEND_CANISTER_ID="$1}' >> .env