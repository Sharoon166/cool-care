<script lang="ts">
import { enhance } from '$app/forms';
import Button from '$lib/components/ui/button/button.svelte';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { toast } from 'svelte-sonner';
import SaveIcon from '@tabler/icons-svelte/icons/device-floppy';
import UserIcon from '@tabler/icons-svelte/icons/user';
import LockIcon from '@tabler/icons-svelte/icons/lock';
import KeyIcon from '@tabler/icons-svelte/icons/key';
import PageHeader from '$lib/components/page-header.svelte';
import At from '@tabler/icons-svelte/icons/at';
import EyeIcon from '@tabler/icons-svelte/icons/eye';
import EyeOffIcon from '@tabler/icons-svelte/icons/eye-off';
import BankIcon from '@tabler/icons-svelte/icons/building-bank';
import SmartphoneIcon from '@tabler/icons-svelte/icons/device-mobile';
import CreditCardIcon from '@tabler/icons-svelte/icons/credit-card';

let { data, form } = $props();

let loading = $state(false);
let activeTab = $state<'profile' | 'security' | 'payment'>('profile');
let showCurrentPassword = $state(false);
let showNewPassword = $state(false);
let showConfirmPassword = $state(false);

// Profile form data
let profileData = $state({
  name: '',
  email: '',
  username: ''
});

// Initialize profile data when component loads
$effect(() => {
  if (data.user) {
    profileData.name = data.user.name || '';
    profileData.email = data.user.email || '';
    profileData.username = data.user.username || '';
  }
});

// Password form data
let passwordData = $state({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

function resetPasswordForm() {
  passwordData.currentPassword = '';
  passwordData.newPassword = '';
  passwordData.confirmPassword = '';
}

// Payment settings form data
let paymentData = $state({
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIban: '',
  bankSwiftCode: '',
  jazzCashAccountNumber: '',
  jazzCashAccountTitle: '',
  easyPaisaAccountNumber: '',
  easyPaisaAccountTitle: ''
});

// Initialize payment data when component loads
$effect(() => {
  if (data.paymentSettings) {
    paymentData.bankName = data.paymentSettings.bank?.bankName || '';
    paymentData.bankAccountName = data.paymentSettings.bank?.accountName || '';
    paymentData.bankAccountNumber = data.paymentSettings.bank?.accountNumber || '';
    paymentData.bankIban = data.paymentSettings.bank?.iban || '';
    paymentData.bankSwiftCode = data.paymentSettings.bank?.swiftCode || '';
    paymentData.jazzCashAccountNumber = data.paymentSettings.jazzCash?.accountNumber || '';
    paymentData.jazzCashAccountTitle = data.paymentSettings.jazzCash?.accountTitle || '';
    paymentData.easyPaisaAccountNumber = data.paymentSettings.easyPaisa?.accountNumber || '';
    paymentData.easyPaisaAccountTitle = data.paymentSettings.easyPaisa?.accountTitle || '';
  }
});

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
  { id: 'payment', label: 'Payment', icon: CreditCardIcon }
] as const;
</script>

<svelte:head>
  <title>Settings - {profileData.name}</title>
</svelte:head>

<div class="mb-10">
  <PageHeader title="Settings" description="Manage your account settings and preferences" />
</div>

<div class="flex flex-col gap-6 md:flex-row">
  <!-- Tabs - Horizontal scroll on mobile, vertical sidebar on desktop -->
  <div class="w-full md:w-56 md:shrink-0">
    <div class="flex gap-2 overflow-x-auto md:sticky md:top-6 md:flex-col md:space-y-3">
      {#each tabs as tab (tab.label)}
        {@const Icon = tab.icon}
        <button
          onclick={() => (activeTab = tab.id)}
          class="shrink-0 rounded-xl border-2 border-brutal px-4 py-2 text-left font-bold transition-all
            {activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background'}"
        >
          <div class="flex items-center gap-3">
            <Icon class="h-5 w-5" />
            <span>{tab.label}</span>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Content Area -->
  <div class="min-w-0 flex-1 max-w-3xl">
    {#if activeTab === 'profile'}
      <!-- Profile Settings -->
      <div class="rounded-3xl brutal-card bg-card p-4 sm:p-8">
        <div class="mb-6 border-b border-border/40 pb-4">
          <h2 class="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <UserIcon class="h-5 w-5 sm:h-6 sm:w-6" />
            Profile Information
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Update your personal information and account details
          </p>
        </div>

        <form
          method="POST"
          action="?/updateProfile"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === 'success') {
                toast.success('Profile updated successfully');
              } else if (result.type === 'failure') {
                toast.error('Failed to update profile');
              }
              await update();
            };
          }}
          class="space-y-6"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name" class="font-bold">Full Name</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  bind:value={profileData.name}
                  placeholder="Enter your full name"
                  class="pl-10 brutal"
                  required
                />
              </div>
              {#if form?.errors && 'name' in form.errors && form.errors.name}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.name[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="email" class="font-bold">Email Address</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <At class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  bind:value={profileData.email}
                  placeholder="Enter your email"
                  class="pl-10 brutal"
                  required
                />
              </div>
              {#if form?.errors && 'email' in form.errors && form.errors.email}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.email[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="username" class="font-bold">Username</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <At class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  bind:value={profileData.username}
                  placeholder="Enter your username"
                  class="pl-10 brutal"
                />
              </div>
              {#if form?.errors && 'username' in form.errors && form.errors.username}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.username[0]}</p>
              {/if}
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={loading} class="brutal">
              {#if loading}
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Updating...
              {:else}
                <SaveIcon class="mr-2 h-4 w-4" />
                Update Profile
              {/if}
            </Button>
          </div>
        </form>
      </div>
    {:else if activeTab === 'security'}
      <!-- Security Settings -->
      <div class="rounded-3xl brutal-card bg-card p-4 sm:p-8">
        <div class="mb-6 border-b border-border/40 pb-4">
          <h2 class="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <LockIcon class="h-5 w-5 sm:h-6 sm:w-6" />
            Change Password
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <form
          method="POST"
          action="?/changePassword"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === 'success') {
                toast.success('Password changed successfully');
                resetPasswordForm();
              } else if (result.type === 'failure') {
                toast.error('Failed to change password');
              }
              await update();
            };
          }}
          class="space-y-6"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="currentPassword" class="font-bold">Current Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  bind:value={passwordData.currentPassword}
                  placeholder="Enter your current password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showCurrentPassword = !showCurrentPassword)}
                >
                  {#if showCurrentPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'currentPassword' in form.errors && form.errors.currentPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">
                  {form.errors.currentPassword[0]}
                </p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="newPassword" class="font-bold">New Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  bind:value={passwordData.newPassword}
                  placeholder="Enter your new password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showNewPassword = !showNewPassword)}
                >
                  {#if showNewPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'newPassword' in form.errors && form.errors.newPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">{form.errors.newPassword[0]}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword" class="font-bold">Confirm New Password</Label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  bind:value={passwordData.confirmPassword}
                  placeholder="Confirm your new password"
                  class="pr-10 pl-10 brutal"
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground"
                  onclick={() => (showConfirmPassword = !showConfirmPassword)}
                >
                  {#if showConfirmPassword}
                    <EyeOffIcon class="h-5 w-5 text-muted-foreground" />
                  {:else}
                    <EyeIcon class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </button>
              </div>
              {#if form?.errors && 'confirmPassword' in form.errors && form.errors.confirmPassword}
                <p class="mt-1 text-sm text-red-600 font-semibold">
                  {form.errors.confirmPassword[0]}
                </p>
              {/if}
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={loading} class="brutal">
              {#if loading}
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Changing...
              {:else}
                <LockIcon class="mr-2 h-4 w-4" />
                Change Password
              {/if}
            </Button>
          </div>
        </form>
      </div>
    {:else if activeTab === 'payment'}
      <!-- Payment Settings -->
      <div class="rounded-3xl brutal-card bg-card p-4 sm:p-8">
        <div class="mb-6 border-b border-border/40 pb-4">
          <h2 class="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <CreditCardIcon class="h-5 w-5 sm:h-6 sm:w-6" />
            Payment Details
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Configure payment methods displayed on invoices. Only filled fields will appear on PDFs.
          </p>
        </div>

        <form
          method="POST"
          action="?/savePaymentSettings"
          use:enhance={() => {
            loading = true;
            return async ({ result, update }) => {
              loading = false;
              if (result.type === 'success') {
                toast.success('Payment settings saved successfully');
              } else if (result.type === 'failure') {
                toast.error('Failed to save payment settings');
              }
              await update();
            };
          }}
          class="space-y-6"
        >
          <!-- Bank Details -->
          <div class="space-y-6">
            <h3 class="flex items-center gap-2 font-semibold text-lg">
              <BankIcon class="h-5 w-5" />
              Bank Transfer Details
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="bankName" class="font-bold">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  type="text"
                  bind:value={paymentData.bankName}
                  placeholder="e.g., HBL Bank Limited"
                  class="brutal"
                />
              </div>
              <div class="space-y-2">
                <Label for="bankAccountName" class="font-bold">Account Title</Label>
                <Input
                  id="bankAccountName"
                  name="bankAccountName"
                  type="text"
                  bind:value={paymentData.bankAccountName}
                  placeholder="e.g., Cool Care Solutions"
                  class="brutal"
                />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="bankAccountNumber" class="font-bold">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  bind:value={paymentData.bankAccountNumber}
                  placeholder="e.g., PK12HABL1234567890123"
                  class="brutal"
                />
              </div>
              <div class="space-y-2">
                <Label for="bankIban" class="font-bold">IBAN</Label>
                <Input
                  id="bankIban"
                  name="bankIban"
                  type="text"
                  bind:value={paymentData.bankIban}
                  placeholder="e.g., PK12HABL1234567890123456789"
                  class="brutal"
                />
              </div>
              <div class="space-y-2">
                <Label for="bankSwiftCode" class="font-bold">SWIFT Code</Label>
                <Input
                  id="bankSwiftCode"
                  name="bankSwiftCode"
                  type="text"
                  bind:value={paymentData.bankSwiftCode}
                  placeholder="e.g., HABLPKKA"
                  class="brutal"
                />
              </div>
            </div>
          </div>

          <!-- JazzCash -->
          <div class="space-y-6 border-t border-border/40 pt-6">
            <h3 class="flex items-center gap-2 font-semibold text-lg">
              <SmartphoneIcon class="h-5 w-5" />
              JazzCash
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="jazzCashAccountNumber" class="font-bold">Account Number</Label>
                <Input
                  id="jazzCashAccountNumber"
                  name="jazzCashAccountNumber"
                  type="text"
                  bind:value={paymentData.jazzCashAccountNumber}
                  placeholder="e.g., 0336-3097147"
                  class="brutal"
                />
              </div>
              <div class="space-y-2">
                <Label for="jazzCashAccountTitle" class="font-bold">Account Title</Label>
                <Input
                  id="jazzCashAccountTitle"
                  name="jazzCashAccountTitle"
                  type="text"
                  bind:value={paymentData.jazzCashAccountTitle}
                  placeholder="e.g., Allah Ditta Masih"
                  class="brutal"
                />
              </div>
            </div>
          </div>

          <!-- Easypaisa -->
          <div class="space-y-6 border-t border-border/40 pt-6">
            <h3 class="flex items-center gap-2 font-semibold text-lg">
              <SmartphoneIcon class="h-5 w-5" />
              Easypaisa
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="easyPaisaAccountNumber" class="font-bold">Account Number</Label>
                <Input
                  id="easyPaisaAccountNumber"
                  name="easyPaisaAccountNumber"
                  type="text"
                  bind:value={paymentData.easyPaisaAccountNumber}
                  placeholder="e.g., 0336-3097147"
                  class="brutal"
                />
              </div>
              <div class="space-y-2">
                <Label for="easyPaisaAccountTitle" class="font-bold">Account Title</Label>
                <Input
                  id="easyPaisaAccountTitle"
                  name="easyPaisaAccountTitle"
                  type="text"
                  bind:value={paymentData.easyPaisaAccountTitle}
                  placeholder="e.g., Allah Ditta Masih"
                  class="brutal"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={loading} class="brutal">
              {#if loading}
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Saving...
              {:else}
                <SaveIcon class="mr-2 h-4 w-4" />
                Save Payment Settings
              {/if}
            </Button>
          </div>
        </form>
      </div>
    {/if}
  </div>
</div>
