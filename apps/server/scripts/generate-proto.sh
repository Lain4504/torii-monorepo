#!/bin/bash

# Directory where your .proto files are located
PROTO_DIR="./proto"

# Output directory for generated TypeScript files
OUT_DIR="./libs/proto/src/generated"

# Dependencies (Vendored locally)
DEPS_DIR="./proto/dependencies"

# Determine Plugin Path based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    RAW_PLUGIN_PATH="$(pwd)/node_modules/.bin/protoc-gen-ts_proto.cmd"
    if command -v cygpath &> /dev/null; then
        PLUGIN_PATH=$(cygpath -w "$RAW_PLUGIN_PATH")
    else
        PLUGIN_PATH="$RAW_PLUGIN_PATH"
    fi
else
    PLUGIN_PATH="./node_modules/.bin/protoc-gen-ts_proto"
fi

echo "Using plugin: $PLUGIN_PATH"

mkdir -p $OUT_DIR

if ! command -v protoc &> /dev/null
then
    echo "protoc could not be found. Please install Protocol Buffers compiler."
    exit 1
fi

echo "Generating TypeScript files..."

# Point to local vendored dependencies
protoc \
  --plugin="protoc-gen-ts_proto=$PLUGIN_PATH" \
  --ts_proto_out=$OUT_DIR \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=false \
  --ts_proto_opt=outputClientImpl=false \
  --ts_proto_opt=annotateDependencies=false \
  --proto_path=$PROTO_DIR \
  --proto_path="$DEPS_DIR/protovalidate" \
  --proto_path="$DEPS_DIR/livekit" \
  $PROTO_DIR/*.proto

echo "Done! Generated files in $OUT_DIR"
