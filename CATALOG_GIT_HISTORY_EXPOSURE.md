# Legacy dataset Git-history exposure

Audit date: 2026-08-19

## Finding

The private legacy product dataset was committed to the `main` branch before
the Ventrovia brand-only separation. Deleting files in a later commit would not
remove those objects from Git history. The Git remote is private, but a clone
with access to the pre-purge history could reconstruct the dataset.

## Required remediation

1. Verify the owner's external archive and a restore test.
2. Create an owner-only full-history safety bundle and a clean-tree backup.
3. replace the remote `main` history with the tested brand-only tree;
4. verify that no product-data path or representative record marker is reachable
   from any remote branch or tag;
5. expire provider-side caches, releases, artifacts and old deployments where
   the provider exposes that control;
6. rotate deployment or repository credentials if access was wider than intended.

The repository backup and legacy archive are owner-local assets and are never
deployment inputs.

## Limits

Git history rewriting removes reachability from branch and tag references; it
cannot revoke clones already downloaded by another authorized user or guarantee
the retention schedule of a hosting provider's internal backups. Provider-side
artifact and backup deletion must therefore be audited separately.
