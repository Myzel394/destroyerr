/* Run `nix develop --command $SHELL` */
{
  description = "Dev Shell for destroyerr";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, utils, ... } @ inputs: 
    utils.lib.eachDefaultSystem(system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_24
            yarn
            tsx
            corepack
            git
            biome
            esbuild

            just
          ];
        };
      }
    );
}
