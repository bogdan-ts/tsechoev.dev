<script lang="ts">
  type Props = {
    title: string;
    titleId: string;
  };

  let { title, titleId }: Props = $props();
</script>

<h2 id={titleId}>{title}</h2>
