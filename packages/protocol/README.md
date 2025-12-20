# @workspace/protocol

Protocol Buffer definitions and generated TypeScript code using @bufbuild/protobuf.

## Structure

```
packages/protocol/
├── proto/                    # Proto files (includes dependencies)
│   ├── wajlc_*.proto        # WAJLC protocol definitions
│   ├── livekit_*.proto      # LiveKit dependencies (copied)
│   ├── buf/validate/        # Protovalidate (copied)
│   └── logger/              # LiveKit logger (copied)
├── src/
│   ├── gen/                 # Generated TypeScript (@bufbuild format)
│   └── index.ts            # Package exports
├── dist/                    # Built output (CommonJS + ESM)
├── buf.yaml                # Buf workspace config
├── buf.gen.yaml            # Buf generation config
└── package.json
```

## Generated with @bufbuild/protobuf

This package uses [@bufbuild/protobuf](https://buf.build/docs/ecosystem/protobuf-es) for type-safe protocol buffer support in TypeScript.

## Usage

```typescript
import { CommonResponse, RoomMetadata } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

// Create a message
const response = create(CommonResponse, {
  status: true,
  msg: 'Success'
});
```

## Development

### Regenerate TypeScript from Proto

```bash
pnpm run clean      # Clean generated files
pnpm run generate   # Generate from .proto files
pnpm run build      # Build to dist/
```

### Update Dependencies

When protocol dependencies change:

1. **Update proto files in `proto/` directory**:
   - WAJLC files: Edit directly
   - LiveKit dependencies: Re-copy from livekit-protocol
   - Protovalidate: Re-copy from protovalidate

2. **Regenerate**:
   ```bash
   pnpm run generate
   pnpm run build
   ```

## Dependencies Included

The `proto/` directory includes:

- **WAJLC protocols** (20 files): Core protocol definitions
- **LiveKit models** (19 files): Required by WAJLC for room/participant types
- **Buf Validate**: Proto validation framework
- **Logger**: LiveKit logging proto

> [!NOTE]
> Dependencies are **copied** into proto/ for simplicity. This approach ensures:
> - No complex buf workspace configuration needed
> - All imports resolve locally
> - Simple buf generate workflow

## Output

**Generated files**: 41 TypeScript files with @bufbuild format

- CommonJS in `dist/`
- ESM in `dist/esm/`
- Type definitions in `dist/index.d.ts`

## Scripts

- `pnpm run generate` - Generate TypeScript from proto files
- `pnpm run build` - Build CommonJS + ESM
- `pnpm run clean` - Remove generated files
