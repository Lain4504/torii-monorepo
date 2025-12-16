# How to Get User Seed for auth-service

You created a user `auth-service` with public key:
```
UDYEW2MZL77X2DBXBOZF2XPD3ENQWALQRXPOKYQ2PFZIW2TDAPLJEH4C
```

## Option 1: From .nk file (Recommended)

The seed is stored in the `.nk` file:

```bash
docker run --rm -it -v "${PWD}/nsc:/nsc" natsio/nats-box:latest

# Inside container:
cat /nsc/nkeys/keys/U/DY/UDYEW2MZL77X2DBXBOZF2XPD3ENQWALQRXPOKYQ2PFZIW2TDAPLJEH4C.nk
```

Copy the output (starts with `SU...`) to `.env` as `NATS_NKEY_SEED`

## Option 2: From .creds file

The `.creds` file contains both JWT and seed:

```bash
docker run --rm -it -v "${PWD}/nsc:/nsc" natsio/nats-box:latest

# Inside container:
cat /nsc/nkeys/creds/MYOP/PNM/auth-service.creds
```

Look for the line starting with `SU...` (the seed, not the JWT)

## Option 3: Generate new user

If you can't find the seed, generate a new user:

```bash
docker run --rm -it -v "${PWD}/nsc:/nsc" natsio/nats-box:latest

# Inside container:
nsc delete user auth-service -a PNM
nsc add user auth-service -a PNM

# Get the seed:
cat /nsc/nkeys/keys/U/DY/UDYEW2MZL77X2DBXBOZF2XPD3ENQWALQRXPOKYQ2PFZIW2TDAPLJEH4C.nk
```

Then update `nats_server.conf` with the new public key.

## Complete .env Example

After getting the seed:

```bash
NATS_ACCOUNT_SEED=SAAB4IFWUI2KFNAXDT44WX2SSUTGCT46TBBLU2BN2CXKPDXDELRK5DJI74
NATS_XKEY_SEED=SXAMBYY64TKXZCLFQGWDATGPIPURA4SIV3GDCSGG7A74USK6XDO6WQTIUU
NATS_NKEY_SEED=SUxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # ← Paste here
```
