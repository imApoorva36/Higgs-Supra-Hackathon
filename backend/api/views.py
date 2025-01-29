from rest_framework.response import Response
from .serializers import TagSerializer
from rest_framework.decorators import (api_view)
from .models import Tag
from .utils import createRandomKey, readTag, writeTag, servo, verify_image_matches_description
from rest_framework import status
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
def create_tag(request):
    if request.data.get('tag_id') is None:
        randomKey = createRandomKey()
        try:
            writeTag(randomKey)
        except:
            return Response({"error": "Failed to Assign Key"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        request.data['tag_id'] = randomKey
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    else:
        return Response({'error': 'Tag ID is already initialized'}, status=400)
    
@api_view(['GET'])
def get_tag(request):
    try:
        _id, code = readTag()
        print(code)
        tag = Tag.objects.get(tag_id=str(code).strip())
        serializer = TagSerializer(tag)
        return Response(serializer.data)
    except Tag.DoesNotExist:
        return Response({"error": "Tag not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def actuate_servo(request):
    servo(10)
    return Response({"message": "success"}, status=status.HTTP_200_OK)

def verify_package_content(request):
    product_description = request.data.get('product_description')
    image_url = request.data.get('image_url')
    response_json = verify_image_matches_description(image_url, product_description)

    return Response(json.loads(response_json))

@api_view(['GET'])
def detect_object(request):
    return Response({"status": True})
