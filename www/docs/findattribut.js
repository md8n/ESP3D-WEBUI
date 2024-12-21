function FindByAttributeValue(attribute, value)    {
  const All = document.getElementsByTagName('*');
  for (let i = 0; i < All.length; i++)       {
    if (All[i].getAttribute(attribute) === value) { return All[i]; }
  }
}
